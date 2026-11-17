"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  LayoutGrid,
  LogOut,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { fetchDashboardData, type DashboardData } from "@/lib/dashboard-data";

const railItems = [
  { label: "Scheduling & attendance", icon: CalendarDays, href: "/dashboard", view: "scheduling" },
  { label: "Student records & administration", icon: Users, href: "/dashboard/records", view: "records" },
] as const;

type DashboardViewName = "scheduling" | "records";

function DashboardView({ view }: { view: DashboardViewName }) {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [query, setQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isChecking) return;

    let isCurrent = true;

    fetchDashboardData()
      .then((data) => {
        if (isCurrent) {
          setDashboardData(data);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setDataError(error instanceof Error ? error.message : "Unable to load dashboard data.");
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isChecking, retryCount]);

  const sections = dashboardData?.sections ?? [];
  const students = dashboardData?.students ?? [];
  const attendance = dashboardData?.attendance ?? [];
  const grades = dashboardData?.grades ?? [];
  const fees = dashboardData?.fees ?? [];

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = sections.filter((section) =>
    `${section.name} ${section.teacher} ${section.subject}`.toLowerCase().includes(normalizedQuery),
  );
  const visibleStudents = students.filter((student) =>
    `${student.id} ${student.name} ${student.birthDate} ${student.contact} ${student.section} ${student.enrolled}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
  const visibleAttendance = attendance.filter((record) =>
    `${record.student} ${record.section} ${record.date} ${record.status}`.toLowerCase().includes(normalizedQuery),
  );
  const visiblePerformance = grades.filter((record) =>
    `${record.student} ${record.section}`.toLowerCase().includes(normalizedQuery),
  );
  const visiblePayments = fees.filter((fee) =>
    `${fee.student} ${fee.description} ${fee.amount}`.toLowerCase().includes(normalizedQuery),
  );

  const uniqueAttendees = new Set(attendance.map((record) => record.student)).size;

  if (isChecking) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center">
        <p className="text-sm">Verifying session...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center">
        <p role="status" className="text-sm">Loading live dashboard data...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center px-4">
        <section className="carbon-panel max-w-lg rounded-2xl p-6 text-center shadow-[7px_7px_0_0_rgba(41,42,39,0.12)]">
          <h1 className="font-serif text-2xl">Dashboard data unavailable</h1>
          <p role="alert" className="mt-3 text-sm opacity-75">{dataError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              type="button"
              onClick={() => {
                setDataError(null);
                setIsLoading(true);
                setRetryCount((count) => count + 1);
              }}
            >
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearTokens();
                router.push(CONFIG.ROUTES.LOGIN);
              }}
            >
              Log out
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center">
        <p role="alert" className="text-sm">Dashboard data was not returned by the backend.</p>
      </div>
    );
  }

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  return (
    <div className="dashboard-theme min-h-screen px-4 pb-10 sm:px-8 lg:pl-28">
      <aside className="carbon-panel fixed inset-y-6 left-6 z-20 hidden w-[72px] flex-col items-center rounded-2xl py-6 shadow-[8px_8px_0_0_rgba(41,42,39,0.12)] lg:flex">
        <div className="mb-6 h-1 w-8 bg-ivory/20" />
        <nav aria-label="Dashboard pages" className="flex flex-col gap-3">
          {railItems.map(({ label, icon: Icon, href, view: itemView }) => {
            const isActive = itemView === view;
            const className = `relative grid size-11 place-items-center transition-[background-color,transform,opacity] duration-200 hover:-translate-y-0.5 ${
              isActive ? "bg-carbon-soft opacity-100" : "opacity-55 hover:bg-carbon-soft"
            }`;

            return (
              <Link
                key={label}
                href={href}
                aria-label={label}
                title={label}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                <Icon size={19} strokeWidth={2} />
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={handleLogout}
            className="hover:bg-carbon-soft"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </aside>

      <main id="overview" className="mx-auto max-w-[1480px]">
        <header className="sticky top-0 z-10 -mx-4 mb-8 flex min-h-[72px] items-center justify-between gap-3 border-b border-carbon bg-porcelain/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="mr-1 hidden h-7 w-1 bg-[#d65d3b] sm:block" />
            <LayoutGrid size={17} className="shrink-0" />
            <span className="truncate font-medium">Academic office</span>
            <span className="opacity-60">/ {view === "scheduling" ? "Scheduling & attendance" : "Student & administration records"}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <span
              role="status"
              className="carbon-inset inline-flex items-center gap-2 px-2.5 py-2 text-[10px] font-medium sm:px-3 sm:text-xs"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-ivory/70" aria-hidden="true" />
              Connected to live records
            </span>
            <label className="carbon-inset hidden w-[min(34vw,340px)] items-center gap-2 px-3 py-2.5 sm:flex">
              <Search size={16} />
              <input
                aria-label="Search academic records"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students, sections, courses"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ivory/60"
              />
            </label>
            <Bell aria-hidden="true" size={19} className="hidden sm:block" />
            <div className="mx-1 grid size-8 place-items-center rounded-full bg-carbon-soft text-xs font-semibold sm:mx-2">A</div>
            <Button
              type="button"
              variant="outline"
              aria-label="Log out"
              onClick={handleLogout}
              className="carbon-inset h-10 px-3 text-xs transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:text-sm"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>

        <nav aria-label="Dashboard pages" className="mb-5 grid grid-cols-2 gap-2 lg:hidden">
          {railItems.map(({ label, href, view: itemView }) => (
            <Link
              key={label}
              href={href}
              aria-current={itemView === view ? "page" : undefined}
              className={`carbon-inset px-3 py-2 text-center text-xs transition-opacity ${
                itemView === view ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="grid items-start gap-5 xl:grid-cols-[1.65fr_1fr]">
          {view === "scheduling" && (
            <>
              <section id="schedule" aria-label="Academic schedule" className="carbon-panel min-w-0 rounded-2xl p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
                <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] opacity-70">Academic scheduling</p>
                    <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Sections & assignments</h2>
                  </div>
                  <div className="carbon-inset flex items-center gap-2 px-3 py-2.5 text-xs">
                    <CalendarDays size={15} />
                    <span>Live backend data</span>
                  </div>
                </div>

                <div className="mb-7 grid grid-cols-3 border-y border-ivory/40 py-5">
                  {[
                    { value: sections.length, label: "Sections" },
                    { value: dashboardData.subjects.length, label: "Subjects" },
                    { value: dashboardData.professors.length, label: "Professors" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-serif text-3xl leading-none tracking-tight sm:text-4xl">{stat.value}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-70 sm:text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-medium">Sections in the database</span>
                    <span className="opacity-60">{sections.length} total</span>
                  </div>
                  <div className="h-px bg-ivory/40" />
                </div>

                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Section assignments</h3>
                  <span className="text-xs opacity-60">Section · Subject · Teacher</span>
                </div>
                <ul className="divide-y">
                  {visibleSections.map((section) => (
                    <li key={section.id} className="group flex items-start gap-3 border-b border-ivory/30 py-4 transition-transform duration-200 hover:translate-x-1 last:border-0">
                      <span className="carbon-inset mt-0.5 grid size-9 shrink-0 place-items-center text-[11px] font-medium">
                        <Users size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{section.name}</p>
                        <p className="mt-1 truncate text-[11px] opacity-60">
                          {section.subject} · {section.teacher}
                        </p>
                      </div>
                    </li>
                  ))}
                  {visibleSections.length === 0 && (
                    <li className="py-5 text-center text-sm opacity-60">No sections match “{query}”.</li>
                  )}
                </ul>
              </section>

              <section id="attendance" aria-label="Attendance tracking" className="carbon-panel overflow-hidden rounded-2xl p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Attendance tracking</p>
                    <h2 className="font-serif text-2xl tracking-[-0.04em] sm:text-3xl">Attendance records</h2>
                  </div>
                  <span className="carbon-inset flex items-center gap-1.5 px-3 py-2 text-xs">
                    <CalendarDays size={14} />
                    {attendance.length} records
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-2 border-y border-ivory/40 py-5">
                  <div className="pr-3">
                    <p className="font-serif text-3xl leading-none sm:text-4xl">{attendance.length}</p>
                    <p className="mt-2 text-xs opacity-60">Attendance records</p>
                  </div>
                  <div className="border-l border-ivory/40 pl-4">
                    <p className="font-serif text-3xl leading-none sm:text-4xl">{uniqueAttendees}</p>
                    <p className="mt-2 text-xs opacity-60">Students with records</p>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent section attendance</h3>
                  <span className="text-[11px] opacity-60">By date</span>
                </div>
                <ul>
                  {visibleAttendance.map((record) => (
                    <li key={record.id} className="flex items-center gap-3 border-b border-ivory/30 py-3 transition-transform duration-200 hover:translate-x-1 last:border-0">
                      <span className={`grid size-8 shrink-0 place-items-center ${record.status === "Absent" ? "bg-carbon-soft" : "bg-[#d65d3b]"}`}>
                        <Check size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{record.student}</p>
                        <p className="mt-1 truncate text-[11px] opacity-60">
                          {record.section} · {record.date}
                        </p>
                      </div>
                      <span className={`carbon-inset rounded-full px-2.5 py-1 text-[10px] font-medium ${record.status === "Absent" ? "opacity-60" : ""}`}>
                        {record.status}
                      </span>
                    </li>
                  ))}
                  {visibleAttendance.length === 0 && (
                    <li className="py-5 text-center text-sm opacity-60">No attendance records match “{query}”.</li>
                  )}
                </ul>
              </section>
            </>
          )}

          {view === "records" && (
            <>
              <section id="students" aria-label="Student records" className="carbon-panel min-w-0 rounded-2xl p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Student record management</p>
                    <h2 className="font-serif text-3xl tracking-[-0.04em]">Student profiles</h2>
                  </div>
                  <a href="#students" className="text-sm font-medium underline underline-offset-4">
                    All records <ArrowUpRight size={15} className="ml-1 inline" />
                  </a>
                </div>
                <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
                  <span className="carbon-inset px-3 py-1.5">{students.length} student records</span>
                  <span className="carbon-inset px-3 py-1.5">{sections.length} sections</span>
                  <span className="carbon-inset px-3 py-1.5">{dashboardData.enrollmentCount} enrollments</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead>
                      <tr className="border-b text-[10px] uppercase tracking-[0.16em] opacity-60">
                        <th className="pb-3 pr-3 font-medium">Student</th>
                        <th className="pb-3 pr-3 font-medium">Birth date</th>
                        <th className="pb-3 pr-3 font-medium">Section</th>
                        <th className="pb-3 pr-3 font-medium">Contact</th>
                        <th className="pb-3 font-medium">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visibleStudents.map((student) => (
                        <tr key={student.id} className="transition-colors duration-200 hover:bg-carbon-soft/50">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-8 shrink-0 place-items-center border border-ivory/40 text-[10px] font-semibold">
                                {student.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{student.name}</p>
                                <p className="mt-1 truncate text-[10px] opacity-60">
                                  {student.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 opacity-80">{student.birthDate}</td>
                          <td className="py-3 pr-3">{student.section}</td>
                          <td className="py-3 pr-3">{student.contact}</td>
                          <td className="py-3 opacity-80">{student.enrolled}</td>
                        </tr>
                      ))}
                      {visibleStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center opacity-60">
                            No student records match “{query}”.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-5">
                <section id="performance" aria-label="Academic performance" className="carbon-panel rounded-2xl p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Academic performance</p>
                      <h2 className="font-serif text-2xl tracking-[-0.04em]">Student averages</h2>
                    </div>
                    <span className="border border-ivory/40 px-2.5 py-1.5 text-xs">Term 1</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[440px] text-left text-[11px]">
                      <thead>
                        <tr className="border-b text-[10px] uppercase tracking-[0.1em] opacity-60">
                          <th className="pb-2 pr-2 font-medium">Student</th>
                          <th className="pb-2 px-2 text-right font-medium">PT</th>
                          <th className="pb-2 px-2 text-right font-medium">Attend.</th>
                          <th className="pb-2 px-2 text-right font-medium">Exams</th>
                          <th className="pb-2 pl-2 text-right font-medium">Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {visiblePerformance.map((record) => (
                          <tr key={record.id} className="transition-colors duration-200 hover:bg-carbon-soft/50">
                            <td className="py-3 pr-2">
                              <p className="font-medium">{record.student}</p>
                              <p className="mt-1 opacity-60">{record.section}</p>
                            </td>
                            <td className="px-2 text-right">{record.tasks}</td>
                            <td className="px-2 text-right">{record.attendance}</td>
                            <td className="px-2 text-right">{record.exams}</td>
                            <td className="pl-2 text-right font-semibold">{record.average}</td>
                          </tr>
                        ))}
                        {visiblePerformance.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-5 text-center opacity-60">
                              No performance records match “{query}”.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="finance" aria-label="Financial administration" className="carbon-panel overflow-hidden rounded-2xl shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between px-5 py-5 sm:px-6">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Financial administration</p>
                      <h2 className="font-serif text-2xl tracking-[-0.04em]">Student accounts</h2>
                    </div>
                    <Button type="button" className="carbon-inset h-9 px-3 text-xs font-medium transition-transform duration-200 hover:-translate-y-0.5 hover:bg-carbon">
                      Payment history
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-y border-ivory/40 px-5 py-4 sm:mx-6 sm:px-0">
                    <div>
                      <p className="font-serif text-2xl">
                        ₱{dashboardData.totalFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-1 text-[10px] opacity-60">Total recorded fees</p>
                    </div>
                    <div className="border-l border-ivory/40 pl-4">
                      <p className="font-serif text-2xl">{fees.length}</p>
                      <p className="mt-1 text-[10px] opacity-60">Fee records</p>
                    </div>
                  </div>
                  <ul className="px-5 sm:px-6">
                    {visiblePayments.map((fee) => (
                      <li key={fee.id} className="flex items-center gap-3 border-b border-ivory/30 py-3 transition-transform duration-200 hover:translate-x-1 last:border-0">
                        <span className="grid size-8 shrink-0 place-items-center border border-ivory/40">
                          <Wallet size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium">{fee.student}</p>
                          <p className="mt-1 truncate text-[10px] opacity-60">
                            {fee.description} · {fee.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold">{fee.amount}</p>
                        </div>
                      </li>
                    ))}
                    {visiblePayments.length === 0 && (
                      <li className="py-5 text-center text-sm opacity-60">No fee records match “{query}”.</li>
                    )}
                  </ul>
                </section>
              </div>
            </>
          )}
        </div>
        <footer className="mt-10 flex flex-col gap-3 border-t border-carbon pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-medium">
            <BookOpen size={14} />
            Academic office
          </span>
          <span className="flex items-center gap-2">
            <Clock3 size={13} />
            {view === "scheduling" ? "Scheduling & attendance overview" : "Student & administration records"}
          </span>
          <span>Live data from connected backend</span>
        </footer>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const view = pathname === "/dashboard/records" ? "records" : "scheduling";

  return <DashboardView view={view} />;
}
