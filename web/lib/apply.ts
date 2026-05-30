// Where trainers send their account request, and the structured application
// template (which doubles as the admin's verification checklist — a student
// can't easily fake a real gym, experience and social profile).

export const ADMIN_CONTACT = process.env.NEXT_PUBLIC_ADMIN_CONTACT ?? "study_track_uz_bot";

export const APPLY_TEMPLATE = `Assalomu alaykum! EduTrack uchun trener akkaunti ochmoqchiman 🙌

1. Ism familiya:
2. Sport turi / yo'nalish:
3. Qayerda dars beraman (zal/klub nomi va manzil):
4. Necha yillik tajriba:
5. Hozir nechta o'quvchim bor:
6. Instagram yoki sahifa havolasi:
7. Kerakli tarif (Bepul / Asosiy / Pro):`;

export function applyLink(): string {
  return `https://t.me/${ADMIN_CONTACT}?text=${encodeURIComponent(APPLY_TEMPLATE)}`;
}
