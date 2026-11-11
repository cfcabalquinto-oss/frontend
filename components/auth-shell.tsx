import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2, GraduationCap, Users, Wallet } from "lucide-react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="auth-theme flex min-h-screen items-center justify-center p-3 sm:p-6">
      <div className="carbon-panel grid min-h-[min(760px,calc(100vh-3rem))] w-full max-w-[1120px] overflow-hidden rounded-[30px] shadow-[0_24px_80px_-36px_rgba(41,42,39,0.45)] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="carbon-panel relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <div className="absolute -right-28 top-32 size-80 rounded-full border-[44px]" />
          <div className="absolute -bottom-28 -left-24 size-80 rounded-full border-[54px]" />
          <div className="relative max-w-md">
            <h2 className="text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[46px]">
              Every part of school, in sync.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed">
              Manage class schedules, student records, attendance, academic results, and fee accounts in one place.
            </p>
            <div className="carbon-inset mt-9 rounded-2xl p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="contrast-ink grid size-10 place-items-center rounded-xl bg-ivory"><CalendarDays size={19} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Academic overview</p>
                  <p className="mt-0.5 text-xs opacity-70">Today · 24 sections · 18 courses</p>
                </div>
                <ArrowUpRight size={17} className="opacity-70" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-carbon pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={15} />
                  <span>Attendance recorded</span>
                </div>
                <span className="text-xs font-semibold">94.8%</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { label: "Students", icon: Users },
                  { label: "Grades", icon: GraduationCap },
                  { label: "Fees", icon: Wallet },
                ].map(({ label, icon: Icon }) => (
                  <span key={label} className="flex items-center justify-center gap-1.5 rounded-lg bg-carbon px-2 py-2 opacity-80">
                    <Icon size={13} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="relative text-xs opacity-70">Schedules · records · attendance · performance · fees</p>
        </aside>

        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[390px]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">Welcome to learnspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed opacity-70">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-7">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
