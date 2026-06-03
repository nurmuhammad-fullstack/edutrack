import QRCode from "qrcode";

export interface InviteData {
  /** Telegram deep-link a student opens to register with this trainer. */
  link: string;
  /** PNG data URL of the QR code encoding `link` (safe to embed in <img>). */
  qrDataUrl: string;
}

/**
 * Build a trainer's personal student-invitation link and matching QR code.
 *
 * Students never browse a directory of trainers — each trainer shares this
 * unique deep link. Opening it sends `/start <trainerId>` to the bot, which
 * replies with a Mini App button scoped to that trainer only.
 */
export async function getInviteData(trainerId: string): Promise<InviteData> {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "study_track_uz_bot";
  const link = `https://t.me/${botUsername}?start=${trainerId}`;

  const qrDataUrl = await QRCode.toDataURL(link, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return { link, qrDataUrl };
}
