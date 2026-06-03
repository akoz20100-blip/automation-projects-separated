/** Shared domain types used across services and routes. */

export type MessageType = "access" | "checkout" | "review";
export type Language = "ar" | "en";
export type Channel = "whatsapp_cloud_api" | "whatsapp_link";

export type DeliveryStatus =
  | "accepted"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "ready"; // ready = link prepared but not auto-sent (manual_link mode)

/** A reservation row as stored in the Google Sheet `Reservations`. */
export interface Reservation {
  reservation_id: string;
  source: string;
  apartment_id: string;
  apartment_name: string;
  guest_name: string;
  guest_phone: string;
  guest_language: Language;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  check_in_time: string; // HH:mm
  check_out_time: string; // HH:mm
  status: string; // confirmed | cancelled | ...
  ocr_needs_review?: boolean;
  guest_phone_confidence?: string;
  airbnb_review_url?: string;
}

/** An apartment row as stored in the Google Sheet `Apartments`. */
export interface Apartment {
  apartment_id: string;
  apartment_name: string;
  default_check_in_time: string;
  default_check_out_time: string;
  access_guideline: string;
  checkout_guideline: string;
  airbnb_listing_url?: string;
  airbnb_review_url?: string;
  maintenance_contact_phone?: string;
  entrance_photo_url?: string;
  video_url?: string;
  building_info?: string;
  landing_lang_default?: Language;
}

/** Fields extracted by the OCR model from a booking screenshot. */
export interface ExtractedReservation {
  guest_name: string | null;
  guest_phone: string | null;
  guest_phone_confidence: "high" | "medium" | "low";
  check_in_date: string | null;
  check_out_date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  reservation_code: string | null;
  source: string | null;
}

/** Result of rendering + (optionally) sending a single message. */
export interface PreparedMessage {
  type: MessageType;
  status: DeliveryStatus | "already_sent";
  channel: Channel;
  recipient_phone: string;
  text: string;
  whatsapp_link?: string;
  message_id?: string;
  template_name?: string;
}

/** A MessageLog row used for audit + idempotency. */
export interface MessageLogRow {
  timestamp: string;
  reservation_id: string;
  message_type: MessageType;
  channel: Channel;
  recipient_phone: string;
  template_name: string;
  language: Language;
  wa_message_id: string;
  status: DeliveryStatus;
  error_code: string;
  rendered_text: string;
  sent_at: string;
}
