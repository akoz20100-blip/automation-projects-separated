/**
 * Daily scheduled jobs — the automation that makes reminders & the cleaner
 * (Sara) notifications fire on their own once deployed. Triggered by Vercel Cron
 * via the /api/cron/* endpoints (see routes/cron.ts and vercel.json).
 *
 * All "which day" logic is computed in the configured timezone (Asia/Riyadh by
 * default) so jobs fire on the correct LOCAL day wherever the server runs.
 *
 *  evening (23:00 Riyadh) — the night before checkout (tomorrow's checkouts):
 *      • guest "checkout" reminder
 *      • owner_checkout notification
 *      • cleaner_checkout notification  (Sara: "guest leaves tomorrow, please clean after")
 *  midday  (12:00 Riyadh):
 *      • today's checkouts → owner_check + cleaner_check (Sara: "has the guest left yet?")
 *      • yesterday's checkouts → guest "review" request
 *
 * Every send is idempotent (MessageLog dedupe), so re-running a slot is safe.
 */

import { env } from "../config/env.js";
import { todayInTz, tomorrowInTz, yesterdayInTz } from "../domain/dates.js";
import { listDueReservations } from "./sheets.js";
import { sendForReservation, sendNotifyForReservation } from "../routes/messages.js";
import type { MessageType, NotifyType } from "../types.js";

export type Slot = "evening" | "midday";

type Job =
  | { kind: "message"; type: MessageType }
  | { kind: "notify"; type: NotifyType };

interface Group {
  reason: string;
  /** Target check_out_date for reservations in this group. */
  date: string;
  jobs: Job[];
}

/** Pure: the reservation-dates and jobs that run for a slot. Timezone-aware. */
export function plannedGroups(slot: Slot, timezone: string, now: Date = new Date()): Group[] {
  if (slot === "evening") {
    return [
      {
        reason: "night-before checkout",
        date: tomorrowInTz(timezone, now),
        jobs: [
          { kind: "message", type: "checkout" },
          { kind: "notify", type: "owner_checkout" },
          { kind: "notify", type: "cleaner_checkout" },
        ],
      },
    ];
  }
  return [
    {
      reason: "checkout day",
      date: todayInTz(timezone, now),
      jobs: [
        { kind: "notify", type: "owner_check" },
        { kind: "notify", type: "cleaner_check" },
      ],
    },
    {
      reason: "review request (day after)",
      date: yesterdayInTz(timezone, now),
      jobs: [{ kind: "message", type: "review" }],
    },
  ];
}

export interface JobResult {
  reservation_id: string;
  job: string;
  status: string;
  error?: string;
}

export interface SlotSummary {
  slot: Slot;
  ran_at: string;
  groups: Array<{ reason: string; date: string; reservations: number }>;
  results: JobResult[];
}

/** Run all jobs for a slot. Never throws — per-job failures are captured so one
 * bad reservation can't block the rest. */
export async function runSlot(slot: Slot, now: Date = new Date()): Promise<SlotSummary> {
  const groups = plannedGroups(slot, env.timezone, now);
  const results: JobResult[] = [];
  const groupSummary: SlotSummary["groups"] = [];

  for (const g of groups) {
    let reservations: Awaited<ReturnType<typeof listDueReservations>>;
    try {
      reservations = await listDueReservations(g.date);
    } catch (e) {
      groupSummary.push({ reason: g.reason, date: g.date, reservations: 0 });
      results.push({ reservation_id: "-", job: g.reason, status: "error", error: (e as Error).message });
      continue;
    }
    groupSummary.push({ reason: g.reason, date: g.date, reservations: reservations.length });

    for (const r of reservations) {
      for (const job of g.jobs) {
        const label = `${job.kind}:${job.type}`;
        try {
          const out =
            job.kind === "message"
              ? await sendForReservation(r.reservation_id, job.type, undefined, false)
              : await sendNotifyForReservation(r.reservation_id, job.type, false);
          results.push({ reservation_id: r.reservation_id, job: label, status: out.status });
        } catch (e) {
          results.push({
            reservation_id: r.reservation_id,
            job: label,
            status: "error",
            error: (e as Error).message,
          });
        }
      }
    }
  }

  return { slot, ran_at: new Date().toISOString(), groups: groupSummary, results };
}
