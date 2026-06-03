import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtMoney(n: number) {
  return n.toLocaleString("uz-UZ") + " so'm";
}

export function relTime(iso: string) {
  const d = new Date(iso);
  const months = [
    "yan","fev","mar","apr","may","iyn",
    "iyl","avg","sen","okt","noy","dek",
  ];
  return (
    d.getDate() +
    " " +
    months[d.getMonth()] +
    ", " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

export function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}
