/**
 * Google Sheets data access for Reservations, Apartments and MessageLog.
 *
 * Uses a service account (JWT). Rows are mapped to objects by header name, so
 * adding columns to the sheet does not break reads. If Sheets credentials are
 * not configured, calls throw a clear error (the service still boots so
 * manual_link/landing/OCR can be exercised without Sheets).
 */

import { google, type sheets_v4 } from "googleapis";
import { env } from "../config/env.js";
import type {
  Apartment,
  Language,
  MessageLogRow,
  MessageType,
  Reservation,
} from "../types.js";

const RESERVATIONS = "Reservations";
const APARTMENTS = "Apartments";
const MESSAGE_LOG = "MessageLog";

let client: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (!env.sheets.spreadsheetId || !env.sheets.serviceAccountEmail || !env.sheets.privateKey) {
    throw new Error(
      "Google Sheets is not configured (set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)",
    );
  }
  if (!client) {
    const auth = new google.auth.JWT({
      email: env.sheets.serviceAccountEmail,
      key: env.sheets.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    client = google.sheets({ version: "v4", auth });
  }
  return client;
}

/** Read a whole tab and return {header, rows} as raw string matrices. */
async function readTab(tab: string): Promise<{ header: string[]; rows: string[][] }> {
  const res = await getClient().spreadsheets.values.get({
    spreadsheetId: env.sheets.spreadsheetId,
    range: tab,
  });
  const values = (res.data.values ?? []) as string[][];
  const header = (values[0] ?? []).map((h) => String(h).trim());
  const rows = values.slice(1);
  return { header, rows };
}

function rowToObject(header: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  header.forEach((key, i) => {
    obj[key] = row[i] ?? "";
  });
  return obj;
}

function toReservation(o: Record<string, string>): Reservation {
  return {
    reservation_id: o.reservation_id ?? "",
    source: o.source ?? "airbnb",
    apartment_id: o.apartment_id ?? "",
    apartment_name: o.apartment_name ?? "",
    guest_name: o.guest_name ?? "",
    guest_phone: o.guest_phone ?? "",
    guest_language: (o.guest_language === "en" ? "en" : "ar") as Language,
    check_in_date: o.check_in_date ?? "",
    check_out_date: o.check_out_date ?? "",
    check_in_time: o.check_in_time ?? "",
    check_out_time: o.check_out_time ?? "",
    status: o.status ?? "",
    ocr_needs_review: String(o.ocr_needs_review).toLowerCase() === "true",
    guest_phone_confidence: o.guest_phone_confidence ?? "",
    airbnb_review_url: o.airbnb_review_url ?? "",
    // Read back the smart-lock code so a passcode issued at intake survives the
    // sheet round-trip and is rendered in the guest's access message.
    door_code: o.door_code ?? "",
  };
}

function toApartment(o: Record<string, string>): Apartment {
  return {
    apartment_id: o.apartment_id ?? "",
    apartment_name: o.apartment_name ?? "",
    default_check_in_time: o.default_check_in_time ?? "15:00",
    default_check_out_time: o.default_check_out_time ?? "12:00",
    access_guideline: o.access_guideline ?? "",
    checkout_guideline: o.checkout_guideline ?? "",
    airbnb_listing_url: o.airbnb_listing_url ?? "",
    airbnb_review_url: o.airbnb_review_url ?? "",
    maintenance_contact_phone: o.maintenance_contact_phone ?? "",
    entrance_photo_url: o.entrance_photo_url ?? "",
    video_url: o.video_url ?? "",
    building_info: o.building_info ?? "",
    landing_lang_default: (o.landing_lang_default === "en" ? "en" : "ar") as Language,
  };
}

export async function getReservation(reservationId: string): Promise<Reservation | null> {
  const { header, rows } = await readTab(RESERVATIONS);
  for (const row of rows) {
    const o = rowToObject(header, row);
    if (o.reservation_id === reservationId) return toReservation(o);
  }
  return null;
}

export async function getApartment(apartmentId: string): Promise<Apartment | null> {
  const { header, rows } = await readTab(APARTMENTS);
  for (const row of rows) {
    const o = rowToObject(header, row);
    if (o.apartment_id === apartmentId) return toApartment(o);
  }
  return null;
}

/** Reservations whose check_out_date equals the target, not cancelled. */
export async function listDueReservations(targetCheckoutDate: string): Promise<Reservation[]> {
  const { header, rows } = await readTab(RESERVATIONS);
  return rows
    .map((row) => toReservation(rowToObject(header, row)))
    .filter((r) => r.check_out_date === targetCheckoutDate && r.status !== "cancelled");
}

/** Find an existing log entry for idempotency on (reservation_id, message_type). */
export async function findMessageLog(
  reservationId: string,
  messageType: string,
): Promise<MessageLogRow | null> {
  const { header, rows } = await readTab(MESSAGE_LOG);
  for (const row of rows) {
    const o = rowToObject(header, row);
    if (o.reservation_id === reservationId && o.message_type === messageType) {
      return o as unknown as MessageLogRow;
    }
  }
  return null;
}

/** Append a MessageLog row in the canonical column order. */
export async function appendMessageLog(entry: MessageLogRow): Promise<void> {
  const order: (keyof MessageLogRow)[] = [
    "timestamp",
    "reservation_id",
    "message_type",
    "channel",
    "recipient_phone",
    "template_name",
    "language",
    "wa_message_id",
    "status",
    "error_code",
    "rendered_text",
    "sent_at",
  ];
  await getClient().spreadsheets.values.append({
    spreadsheetId: env.sheets.spreadsheetId,
    range: MESSAGE_LOG,
    valueInputOption: "RAW",
    requestBody: { values: [order.map((k) => String(entry[k] ?? ""))] },
  });
}

/** Canonical Reservations column order (matches the sheet header row). */
const RESERVATION_COLUMNS: (keyof Reservation)[] = [
  "reservation_id",
  "source",
  "apartment_id",
  "apartment_name",
  "guest_name",
  "guest_phone",
  "guest_language",
  "check_in_date",
  "check_out_date",
  "check_in_time",
  "check_out_time",
  "status",
  "ocr_needs_review",
  "guest_phone_confidence",
  "airbnb_review_url",
  "door_code",
];

/** Append a new reservation row (used by the OCR intake / Telegram bot). */
export async function appendReservation(r: Reservation): Promise<void> {
  const row = RESERVATION_COLUMNS.map((k) => {
    const v = r[k];
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    return v == null ? "" : String(v);
  });
  await getClient().spreadsheets.values.append({
    spreadsheetId: env.sheets.spreadsheetId,
    range: RESERVATIONS,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}
