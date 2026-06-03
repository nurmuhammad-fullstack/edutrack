// Phone is the trainer's login identifier. We don't use SMS — accounts are
// created by the admin with a password. To reuse Supabase email/password auth,
// each phone maps deterministically to a synthetic internal email.

const SYNTHETIC_DOMAIN = "phone.edutrack.app";

/**
 * Normalize an Uzbek phone number to digits only in 998XXXXXXXXX form.
 * Accepts "+998 90 123 45 67", "901234567", "998901234567", etc.
 * Returns null if it can't be made into a plausible 12-digit 998 number.
 */
export function normalizePhone(raw: string): string | null {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;

  // Local 9-digit number → prefix country code.
  if (digits.length === 9) digits = "998" + digits;
  // Some enter 0XXXXXXXXX (10) → drop leading 0, add 998.
  else if (digits.length === 10 && digits.startsWith("0")) digits = "998" + digits.slice(1);

  if (digits.length !== 12 || !digits.startsWith("998")) return null;
  return digits;
}

/** Synthetic email used as the Supabase auth identifier for a phone. */
export function phoneToEmail(normalized: string): string {
  return `${normalized}@${SYNTHETIC_DOMAIN}`;
}

/** Pretty display: +998 90 123 45 67 */
export function formatPhone(normalized: string | null): string {
  if (!normalized || normalized.length !== 12) return normalized ?? "";
  const n = normalized;
  return `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8, 10)} ${n.slice(10, 12)}`;
}
