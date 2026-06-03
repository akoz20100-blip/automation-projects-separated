/**
 * Idempotency guard built on the MessageLog sheet. A message is considered
 * already-sent when a log row exists for (reservation_id, message_type) with a
 * status that is not a failure. This prevents Make re-runs or duplicate
 * triggers from messaging a guest twice.
 */

import type { MessageType } from "../types.js";
import { findMessageLog } from "./sheets.js";

const NON_RESEND_STATUSES = new Set(["accepted", "sent", "delivered", "read", "ready"]);

export interface AlreadySent {
  alreadySent: boolean;
  messageId: string;
  status: string;
}

export async function checkAlreadySent(
  reservationId: string,
  messageType: MessageType,
): Promise<AlreadySent> {
  const existing = await findMessageLog(reservationId, messageType);
  if (existing && NON_RESEND_STATUSES.has(String(existing.status))) {
    return {
      alreadySent: true,
      messageId: existing.wa_message_id ?? "",
      status: String(existing.status),
    };
  }
  return { alreadySent: false, messageId: "", status: "" };
}
