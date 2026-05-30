import { Logo } from "@/components/logo";

// A stylised mockup of the trainer dashboard inside a phone frame — pure
// CSS/markup, on-brand, for the landing hero.
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px]">
      {/* Floating accents */}
      <div className="absolute -left-10 top-20 z-20 hidden sm:flex items-center gap-1.5 bg-white rounded-xl shadow-lg shadow-black/5 border border-slate-100 px-2.5 py-1.5 rotate-[-6deg]">
        <span className="size-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">✓</span>
        <span className="text-[10px] font-semibold text-slate-700">To&apos;landi</span>
      </div>
      <div className="absolute -right-8 top-44 z-20 hidden sm:flex items-center gap-1.5 bg-white rounded-xl shadow-lg shadow-black/5 border border-slate-100 px-2.5 py-1.5 rotate-[5deg]">
        <span className="text-sm">🔔</span>
        <span className="text-[10px] font-semibold text-slate-700">Yangi ariza</span>
      </div>

      {/* Phone frame */}
      <div className="relative w-[270px] h-[560px] rounded-[2.6rem] bg-slate-900 p-2.5 shadow-2xl shadow-primary/20">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-10" />
        <div className="w-full h-full rounded-[2.1rem] bg-[#f7f7f9] overflow-hidden flex flex-col">
          {/* App header */}
          <div className="flex items-center justify-between px-4 h-12 bg-white/80 backdrop-blur border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Logo className="size-5" />
              <span className="text-[13px] font-bold text-primary">EduTrack</span>
            </div>
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">N</div>
          </div>

          {/* Content */}
          <div className="flex-1 px-3.5 py-3 flex flex-col gap-3 overflow-hidden">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5 bg-slate-900 text-white">
                <div className="text-[9px] text-white/60">Jami</div>
                <div className="text-lg font-bold leading-none mt-0.5">24</div>
              </div>
              <div className="rounded-xl p-2.5 bg-white border border-slate-100">
                <div className="text-[9px] text-slate-400">Faol</div>
                <div className="text-lg font-bold leading-none mt-0.5 text-slate-800">20</div>
              </div>
              <div className="rounded-xl p-2.5 bg-white border border-slate-100">
                <div className="text-[9px] text-slate-400">Kutmoqda</div>
                <div className="text-lg font-bold leading-none mt-0.5 text-orange-500">3</div>
              </div>
              <div className="rounded-xl p-2.5 bg-white border border-slate-100">
                <div className="text-[9px] text-slate-400">To&apos;lamagan</div>
                <div className="text-lg font-bold leading-none mt-0.5 text-red-500">5</div>
              </div>
            </div>

            {/* Pending */}
            <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Kutilayotgan arizalar</div>
            <div className="rounded-xl bg-white border border-slate-100 p-2.5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[9px] font-bold">AA</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-800 truncate">Abdurasulov Abdulloh</div>
                  <div className="text-[9px] text-slate-400">1-guruh · 450 000</div>
                </div>
                <span className="text-[8px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">1-guruh</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-6 rounded-lg bg-red-50 text-red-600 text-[10px] font-medium flex items-center justify-center">Rad etish</div>
                <div className="h-6 rounded-lg bg-green-50 text-green-700 text-[10px] font-medium flex items-center justify-center">Tasdiqlash</div>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-100 p-2.5 flex items-center gap-2">
              <div className="size-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">JS</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-800 truncate">Jasur Solihov</div>
                <div className="text-[9px] text-slate-400">2-guruh · 500 000</div>
              </div>
              <span className="text-[9px] font-medium bg-green-600 text-white px-2 py-0.5 rounded-full">To&apos;landi</span>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="h-12 bg-white/90 border-t border-slate-100 flex items-center justify-around px-2">
            {[
              { d: "M9 12h6M9 16h6M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z", active: true },
              { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
              { d: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" },
              { d: "M1 4h22v16H1zM1 10h22" },
            ].map((ic, i) => (
              <svg key={i} className={`size-5 ${ic.active ? "text-primary" : "text-slate-300"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ic.d} />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
