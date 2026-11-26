"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LogOut,
  ReceiptText,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { fetchDashboardData, type DashboardData } from "@/lib/dashboard-data";
import { fetchStudentFeeRecords, type StudentFeeRecord } from "@/lib/fee-data";

const cardClass = "carbon-panel rounded-2xl p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-6";

function PanelHeading({
  eyebrow,
  title,
  detail,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <header className="mb-5 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d9470a]/20 bg-[#d9470a]/10 text-[#ff9a55]">
        <Icon aria-hidden="true" size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4a4ac]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em] sm:text-2xl">{title}</h2>
        <p className="mt-1 text-xs text-[#92929a] sm:text-sm">{detail}</p>
      </div>
    </header>
  );
}

function EmptyState({ children }: { children: string }) {
  return <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-[#92929a]">{children}</p>;
}

function formatPercentage(value: string): string {
  if (value === "—") return value;
  return value.endsWith("%") ? value : `${value}%`;
}

function numericPercentage(value: string): number | null {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return value === "—" || !Number.isFinite(parsed) ? null : parsed;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function formatFeeDate(value: string): string {
  if (!value) return "Date not available";
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(parsed);
}

export default function DashboardRecordsPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [fees, setFees] = useState<StudentFeeRecord[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isChecking) return;
    let active = true;
    setIsLoading(true);
    setDataError(null);
    setFeeError(null);

    fetchDashboardData()
      .then(async (data) => {
        if (!active) return;
        setDashboardData(data);
        if (data.role === "student") {
          try {
            const feeRecords = await fetchStudentFeeRecords();
            if (active) setFees(feeRecords);
          } catch (error) {
            if (active) setFeeError(error instanceof Error ? error.message : "Unable to load fee records.");
          }
        } else {
          setFees([]);
        }
      })
      .catch((error: unknown) => {
        if (active) setDataError(error instanceof Error ? error.message : "Unable to load your records.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isChecking, retryCount]);

  const role = dashboardData?.role ?? "student";
  const grades = dashboardData?.grades ?? [];
  const average = useMemo(() => {
    const values = grades.map((grade) => numericPercentage(grade.average)).filter((value): value is number => value !== null);
    return values.length ? `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)}%` : "—";
  }, [grades]);
  const recordedFeesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);

  const logout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  if (isChecking || isLoading) {
    return <div className="dashboard-theme flex min-h-screen items-center justify-center"><p role="status" className="text-sm text-[#b8b8c0]">{isChecking ? "Verifying session…" : "Loading your records…"}</p></div>;
  }

  if (dataError || !dashboardData) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center px-4">
        <section className={`${cardClass} max-w-lg text-center`}>
          <h1 className="text-2xl font-bold">Records unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-[#b8b8c0]">{dataError ?? "Your records could not be loaded."}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" className="auth-signin-button min-h-11 rounded-xl px-4" onClick={() => setRetryCount((count) => count + 1)}>Try again</Button>
            <Button type="button" variant="outline" className="carbon-inset min-h-11 rounded-xl px-4" onClick={logout}>Log out</Button>
          </div>
        </section>
      </div>
    );
  }

  const isProfessor = role === "professor";
  const gradeSummary = isProfessor
    ? grades.map((grade) => ({
        id: grade.id,
        title: `${grade.student} · ${grade.section}`,
        detail: `Tasks ${formatPercentage(grade.tasks)} · Attendance ${formatPercentage(grade.attendance)} · Exams ${formatPercentage(grade.exams)}`,
        average: formatPercentage(grade.average),
      }))
    : grades.map((grade) => {
        const section = dashboardData.sections.find((item) => item.id === grade.sectionId);
        return {
          id: grade.id,
          title: section ? `${section.subject} · ${section.name}` : grade.section,
          detail: `Tasks ${formatPercentage(grade.tasks)} · Attendance ${formatPercentage(grade.attendance)} · Exams ${formatPercentage(grade.exams)}`,
          average: formatPercentage(grade.average),
        };
      });

  return (
    <div className="dashboard-theme min-h-screen px-4 pb-12 sm:px-8 lg:pl-28">
      <aside className="carbon-panel fixed inset-y-6 left-6 z-20 hidden w-[72px] flex-col items-center rounded-2xl py-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] lg:flex">
        <Link href="/" aria-label="Adali home" className="mb-7 grid size-9 grid-cols-2 place-content-center gap-1 rounded-xl bg-[#d9470a] p-2">
          <span className="size-1.5 rounded-full bg-white" /><span className="size-1.5 rounded-full bg-white/75" />
          <span className="size-1.5 rounded-full bg-white/75" /><span className="size-1.5 rounded-full bg-white" />
        </Link>
        <nav aria-label="Dashboard pages" className="flex flex-col gap-3">
          <Link href="/dashboard#schedule" title="Academic schedule" aria-label="Academic schedule" className="grid size-11 place-items-center rounded-xl text-[#92929a] transition hover:bg-[#1a1a1d] hover:text-white"><CalendarDays size={19} /></Link>
          <Link href="/dashboard/records" aria-current="page" title="Academic performance and fees" aria-label="Academic performance and fees" className="grid size-11 place-items-center rounded-xl bg-[#c93e08] text-white shadow-[0_8px_24px_rgba(201,62,8,0.22)]"><BookOpen size={19} /></Link>
        </nav>
        <div className="mt-auto"><Button type="button" variant="ghost" size="icon" aria-label="Log out" onClick={logout} className="hover:bg-[#1a1a1d]"><LogOut size={18} /></Button></div>
      </aside>

      <main className="mx-auto max-w-[1480px]">
        <header className="sticky top-0 z-10 -mx-4 mb-8 flex min-h-[72px] items-center justify-between gap-3 border-b border-white/10 bg-[#050506]/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="Adali home" className="flex shrink-0 items-center gap-2.5">
              <span aria-hidden="true" className="grid size-8 grid-cols-2 place-content-center gap-0.5 rounded-lg bg-[#d9470a] p-1.5"><span className="size-1 rounded-full bg-white" /><span className="size-1 rounded-full bg-white/75" /><span className="size-1 rounded-full bg-white/75" /><span className="size-1 rounded-full bg-white" /></span>
              <span className="font-extrabold tracking-[-0.04em]">Adali</span>
            </Link>
            <span className="hidden text-[#55555d] sm:inline">/</span>
            <Link href="/dashboard" className="hidden text-sm text-[#a4a4ac] transition hover:text-white sm:inline">Dashboard</Link>
            <span className="hidden text-[#55555d] sm:inline">/</span>
            <span className="truncate text-sm text-white">Records</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="carbon-inset inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium text-[#c7c7ce] sm:text-xs">
              {isProfessor ? <GraduationCap size={14} className="text-[#ff9a55]" /> : <UserRound size={14} className="text-[#ff9a55]" />}
              {isProfessor ? "Professor" : "Student"}
            </span>
            <span className="hidden max-w-40 truncate text-xs text-[#92929a] md:inline">{dashboardData.profile?.name}</span>
            <Button type="button" variant="outline" onClick={logout} className="carbon-inset min-h-10 rounded-xl px-3 text-xs sm:text-sm"><LogOut size={15} /><span className="hidden sm:inline">Log out</span></Button>
          </div>
        </header>

        <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">{isProfessor ? "Gradebook" : "Your records"}</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] sm:text-4xl">Academic records</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#a4a4ac]">{isProfessor ? "Review marks recorded for students in your sections." : "Review your academic performance and fee records in one place."}</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1d] px-3 text-xs font-semibold text-[#d5d5da] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff873e]">Back to dashboard <ArrowUpRight aria-hidden="true" size={14} /></Link>
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-2">
          <article className={cardClass}>
            <PanelHeading
              eyebrow={isProfessor ? "Teaching overview" : "Your progress"}
              title="Academic performance"
              detail={isProfessor ? "Grade records across your teaching sections." : "Current marks across your enrolled subjects."}
              icon={GraduationCap}
            />
            {!isProfessor && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9470a]/20 bg-[#d9470a]/[0.08] px-4 py-3">
                <div><p className="text-xs text-[#a4a4ac]">Overall average</p><p className="mt-1 text-2xl font-bold text-white">{average}</p></div>
                <span className="rounded-full bg-[#d9470a]/15 px-3 py-1.5 text-xs font-semibold text-[#ff9a55]">{grades.length} graded {grades.length === 1 ? "subject" : "subjects"}</span>
              </div>
            )}
            {gradeSummary.length ? (
              <ul className="divide-y divide-white/10">
                {gradeSummary.map((grade) => (
                  <li key={grade.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-1 last:pb-1">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f5f5f7]">{grade.title}</p>
                      <p className="mt-1 text-xs text-[#92929a]">{grade.detail}</p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-[#d9470a]/15 px-3 py-2 text-sm font-bold text-[#ff9a55]">{grade.average}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState>{isProfessor ? "No grade records have been entered for your sections yet." : "Your grades will appear here once your professor records them."}</EmptyState>}
          </article>

          <article className={cardClass}>
            <PanelHeading
              eyebrow={isProfessor ? "Student privacy" : "Transactions"}
              title="Fees"
              detail={isProfessor ? "Fee details are shown in each student’s own account." : "Recorded fee amounts and transaction notes."}
              icon={ReceiptText}
            />
            {isProfessor ? (
              <EmptyState>Fee records are private to each student account and aren’t shown in the professor workspace.</EmptyState>
            ) : feeError ? (
              <p role="alert" className="rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-4 text-sm text-red-200">{feeError}</p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs text-[#a4a4ac]">Total recorded</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(recordedFeesTotal)}</p>
                </div>
                {fees.length ? (
                  <ul className="divide-y divide-white/10">
                    {fees.map((fee) => (
                      <li key={fee.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-1 last:pb-1">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#f5f5f7]">{fee.history}</p>
                          <p className="mt-1 text-xs text-[#92929a]">{formatFeeDate(fee.date)}</p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-[#ff9a55]">{formatCurrency(fee.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <EmptyState>No fee records are available for your account yet.</EmptyState>}
              </>
            )}
          </article>
        </div>

        <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-[#777780]">Adali · {isProfessor ? "Professor records" : "Student records"} <ArrowUpRight aria-hidden="true" size={13} className="ml-1 inline" /></footer>
      </main>
    </div>
  );
}
