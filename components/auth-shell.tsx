import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, GraduationCap, Users, Wallet } from "lucide-react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

const features = [
  { label: "Schedules", icon: CalendarDays },
  { label: "Records", icon: Users },
  { label: "Performance", icon: GraduationCap },
  { label: "Fees", icon: Wallet },
];

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="auth-theme relative flex min-h-[100dvh] flex-col overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 size-[28rem] rounded-full bg-[#d9470a]/10 blur-[100px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:py-6">
        <Link href="/" aria-label="Adali home" className="flex shrink-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 grid-cols-2 place-content-center gap-1 rounded-[0.65rem] bg-[#d9470a] p-2">
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white/75" />
            <span className="size-1.5 rounded-full bg-white/75" />
            <span className="size-1.5 rounded-full bg-white" />
          </span>
          <span className="text-base font-extrabold tracking-[-0.04em] text-white">Adali</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-[#c4c4ca] transition hover:border-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45]"
        >
          Back to home
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-10 pt-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-16 lg:pt-2">
        <aside className="hidden max-w-xl lg:block">
          <h2 className="mt-7 text-[clamp(3.2rem,5vw,4.5rem)] font-black leading-[0.99] tracking-[-0.07em] text-white">
            Where school
            <br />
            stays,
            <br />
            <span className="text-[#ff873e]">in sync.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-[1.7] text-[#a3a3aa]">
            Class schedules, attendance, student records, and school fees together in one clear workspace.
          </p>

          <div className="mt-9 max-w-lg rounded-[1.75rem] border border-white/10 bg-[#0b0b0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.34)] sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#24130c] text-[#ff9a55]">
                  <CalendarDays aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Academic overview</p>
                  <p className="mt-0.5 text-xs text-[#85858d]">Your school at a glance</p>
                </div>
              </div>
              <ArrowUpRight aria-hidden="true" className="size-4 text-[#85858d]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#92929a]">
                  <CheckCircle2 aria-hidden="true" size={13} /> Attendance
                </div>
                <p className="mt-2 text-2xl font-bold leading-none text-white">96%</p>
                <div aria-hidden="true" className="mt-3 h-1 rounded-full bg-[#29292c]">
                  <div className="h-full w-[96%] rounded-full bg-[#d9470a]" />
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#92929a]">
                  <Users aria-hidden="true" size={13} /> Students
                </div>
                <p className="mt-2 text-2xl font-bold leading-none text-white">248</p>
                <p className="mt-2 text-[10px] text-[#85858d]">Across 8 sections</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {features.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#101011] px-2 py-2.5 text-[10px] font-medium text-[#b7b7bd]"
                >
                  <Icon aria-hidden="true" size={13} className="text-[#ff9a55]" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-[440px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d0f]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.42)] sm:p-9">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff9a55]">Welcome to Adali</p>
            <h1 className="text-3xl font-bold tracking-[-0.045em] text-white sm:text-[2.15rem]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#9b9ba2]">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-7 border-t border-white/[0.08] pt-5 text-[#9b9ba2]">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
