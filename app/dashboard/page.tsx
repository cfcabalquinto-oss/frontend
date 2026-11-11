"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Search,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";

const weeklySchedule = [
  { day: "Mon", classes: 8 },
  { day: "Tue", classes: 6 },
  { day: "Wed", classes: 10 },
  { day: "Thu", classes: 7 },
  { day: "Fri", classes: 9 },
];

const schedule = [
  { time: "8:00 AM", course: "General Mathematics", section: "Grade 10 · A", professor: "Prof. Reyes", room: "Room 204" },
  { time: "9:30 AM", course: "Earth Science", section: "Grade 10 · B", professor: "Prof. Santos", room: "Lab 2" },
  { time: "11:00 AM", course: "English Literature", section: "Grade 9 · A", professor: "Prof. Cruz", room: "Room 108" },
  { time: "1:00 PM", course: "Introduction to Biology", section: "Grade 11 · STEM", professor: "Prof. Garcia", room: "Science Lab" },
];

const students = [
  { id: "ST-24018", name: "Amelia Reyes", email: "amelia.reyes@school.edu", birthDate: "14 Mar 2010", section: "Grade 10 · A", enrolled: "Aug 2024", initials: "AR" },
  { id: "ST-24032", name: "Noah Santos", email: "noah.santos@school.edu", birthDate: "02 Jul 2009", section: "Grade 11 · STEM", enrolled: "Aug 2023", initials: "NS" },
  { id: "ST-25007", name: "Sofia Cruz", email: "sofia.cruz@school.edu", birthDate: "21 Nov 2011", section: "Grade 9 · A", enrolled: "Aug 2025", initials: "SC" },
  { id: "ST-24051", name: "Liam Garcia", email: "liam.garcia@school.edu", birthDate: "09 Jan 2010", section: "Grade 10 · B", enrolled: "Aug 2024", initials: "LG" },
];

const attendance = [
  { student: "Amelia Reyes", section: "Grade 10 · A", date: "Nov 10, 2026", status: "Present" },
  { student: "Noah Santos", section: "Grade 11 · STEM", date: "Nov 10, 2026", status: "Present" },
  { student: "Sofia Cruz", section: "Grade 9 · A", date: "Nov 10, 2026", status: "Absent" },
  { student: "Liam Garcia", section: "Grade 10 · B", date: "Nov 09, 2026", status: "Present" },
];

const performance = [
  { student: "Amelia Reyes", section: "Grade 10 · A", tasks: "92%", attendance: "96%", exams: "89%", average: "92.3%" },
  { student: "Noah Santos", section: "Grade 11 · STEM", tasks: "88%", attendance: "94%", exams: "91%", average: "91.0%" },
  { student: "Sofia Cruz", section: "Grade 9 · A", tasks: "85%", attendance: "89%", exams: "87%", average: "87.2%" },
];

const payments = [
  { student: "Amelia Reyes", description: "Tuition · 2nd installment", amount: "₱450", date: "Nov 08", status: "Paid" },
  { student: "Noah Santos", description: "Laboratory fee", amount: "₱85", date: "Nov 06", status: "Paid" },
  { student: "Sofia Cruz", description: "Tuition · 2nd installment", amount: "₱450", date: "Due Nov 15", status: "Due" },
];

const railItems = [
  { label: "Overview", icon: LayoutGrid, href: "#overview" },
  { label: "Schedule", icon: CalendarDays, href: "#schedule" },
  { label: "Students", icon: Users, href: "#students" },
  { label: "Attendance", icon: CheckCircle2, href: "#attendance" },
  { label: "Academics", icon: GraduationCap, href: "#performance" },
  { label: "Finance", icon: Wallet, href: "#finance" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSchedule = useMemo(
    () =>
      schedule.filter((item) =>
        `${item.course} ${item.section} ${item.professor} ${item.room}`.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const visibleStudents = useMemo(
    () =>
      students.filter((student) =>
        `${student.id} ${student.name} ${student.email} ${student.section}`.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const visibleAttendance = useMemo(
    () =>
      attendance.filter((record) =>
        `${record.student} ${record.section} ${record.date} ${record.status}`.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const visiblePerformance = useMemo(
    () =>
      performance.filter((record) =>
        `${record.student} ${record.section}`.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const visiblePayments = useMemo(
    () =>
      payments.filter((payment) =>
        `${payment.student} ${payment.description} ${payment.status}`.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  if (isChecking) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center">
        <p className="text-sm">Verifying session...</p>
      </div>
    );
  }

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  return (
    <div className="dashboard-theme min-h-screen px-4 pb-10 sm:px-8 lg:pl-28">
      <aside className="carbon-panel fixed inset-y-6 left-6 z-20 hidden w-[72px] flex-col items-center py-6 shadow-[8px_8px_0_0_rgba(41,42,39,0.12)] lg:flex">
        <div className="mb-6 h-1 w-8 bg-ivory/20" />
        <nav aria-label="Dashboard sections" className="flex flex-col gap-3">
          {railItems.map(({ label, icon: Icon, href }, index) => {
            const className = `relative grid size-11 place-items-center transition-[background-color,transform,opacity] duration-200 hover:-translate-y-0.5 ${
              index === 0 ? "bg-carbon-soft opacity-100" : "opacity-55 hover:bg-carbon-soft"
            }`;

            return (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                aria-current={index === 0 ? "page" : undefined}
                className={className}
              >
                <Icon size={19} strokeWidth={2} />
              </a>
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
            <span className="opacity-60">/ Overview</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <span
              role="status"
              className="carbon-inset inline-flex items-center gap-2 px-2.5 py-2 text-[10px] font-medium sm:px-3 sm:text-xs"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-ivory/70" aria-hidden="true" />
              In progress (not finished yet)
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

        <div className="grid items-start gap-5 xl:grid-cols-[1.65fr_1fr]">
          <section id="schedule" aria-label="Academic schedule" className="carbon-panel min-w-0 p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] opacity-70">Academic scheduling</p>
                <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Today’s class schedule</h2>
              </div>
              <div className="carbon-inset flex items-center gap-2 px-3 py-2.5 text-xs">
                <CalendarDays size={15} />
                <span>Tuesday, Nov 10</span>
                <SlidersHorizontal size={15} className="ml-1" />
              </div>
            </div>

            <div className="mb-7 grid grid-cols-3 border-y border-ivory/40 py-5">
              {[
                { value: "24", label: "Class sections" },
                { value: "18", label: "Courses" },
                { value: "12", label: "Professors" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl leading-none tracking-tight sm:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-70 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-medium">Classes scheduled this week</span>
                <span className="opacity-60">40 total</span>
              </div>
              <div className="flex h-[92px] items-end justify-between gap-2 border-b border-ivory/40 pb-2 sm:gap-4">
                {weeklySchedule.map(({ day, classes }) => (
                  <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full max-w-12 items-end">
                      <div className={`w-full transition-[height,background-color] duration-200 ${day === "Wed" ? "bg-[#d65d3b]" : "bg-ivory"}`} style={{ height: `${classes * 9}%` }} />
                    </div>
                    <span className="text-[11px] opacity-60">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Assigned schedules</h3>
              <span className="text-xs opacity-60">Course · Section · Professor</span>
            </div>
            <ul className="divide-y">
              {visibleSchedule.map((item) => (
                <li key={`${item.time}-${item.course}`} className="group flex items-start gap-3 border-b border-ivory/30 py-4 transition-transform duration-200 hover:translate-x-1 last:border-0">
                  <span className="carbon-inset mt-0.5 min-w-[78px] px-2 py-2 text-center text-[11px] font-medium">{item.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{item.course}</p>
                    <p className="mt-1 truncate text-[11px] opacity-60">{item.section} · {item.professor} · {item.room}</p>
                  </div>
                </li>
              ))}
              {visibleSchedule.length === 0 && (
                <li className="py-5 text-center text-sm opacity-60">No schedules match “{query}”.</li>
              )}
            </ul>
          </section>

          <section id="attendance" aria-label="Attendance tracking" className="carbon-panel overflow-hidden p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Attendance tracking</p>
                <h2 className="font-serif text-2xl tracking-[-0.04em] sm:text-3xl">November participation</h2>
              </div>
              <span className="carbon-inset flex items-center gap-1.5 px-3 py-2 text-xs"><CalendarDays size={14} />Nov 2026</span>
            </div>

            <div className="mb-6 grid grid-cols-2 border-y border-ivory/40 py-5">
              <div className="pr-3">
                <p className="font-serif text-3xl leading-none sm:text-4xl">94.8%</p>
                <p className="mt-2 text-xs opacity-60">Present this month</p>
              </div>
              <div className="border-l border-ivory/40 pl-4">
                <p className="font-serif text-3xl leading-none sm:text-4xl">1,248</p>
                <p className="mt-2 text-xs opacity-60">Student records</p>
              </div>
            </div>

            <div className="mb-6 flex h-16 items-end justify-between gap-1 border-b border-ivory/40 pb-2">
              {Array.from({ length: 14 }, (_, index) => (
                <span
                  key={index}
                  className={`flex-1 transition-[height,background-color] duration-200 ${index === 5 ? "bg-[#d65d3b]" : index === 11 ? "bg-carbon-soft" : "bg-ivory"}`}
                  style={{ height: `${44 + ((index * 17) % 52)}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent section attendance</h3>
              <span className="text-[11px] opacity-60">By date</span>
            </div>
            <ul>
              {visibleAttendance.map((record) => (
              <li key={`${record.student}-${record.date}`} className="flex items-center gap-3 border-b border-ivory/30 py-3 transition-transform duration-200 hover:translate-x-1 last:border-0">
                <span className={`grid size-8 shrink-0 place-items-center ${record.status === "Absent" ? "bg-carbon-soft" : "bg-[#d65d3b]"}`}><Check size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{record.student}</p>
                    <p className="mt-1 truncate text-[11px] opacity-60">{record.section} · {record.date}</p>
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

          <section id="students" aria-label="Student records" className="carbon-panel min-w-0 p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7 lg:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Student record management</p>
                <h2 className="font-serif text-3xl tracking-[-0.04em]">Student profiles</h2>
              </div>
              <a href="#students" className="text-sm font-medium underline underline-offset-4">All records <ArrowUpRight size={15} className="ml-1 inline" /></a>
            </div>
            <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
              <span className="carbon-inset px-3 py-1.5">1,248 active students</span>
              <span className="carbon-inset px-3 py-1.5">24 sections</span>
              <span className="carbon-inset px-3 py-1.5">Enrollment history</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b text-[10px] uppercase tracking-[0.16em] opacity-60">
                    <th className="pb-3 pr-3 font-medium">Student</th>
                    <th className="pb-3 pr-3 font-medium">Birth date</th>
                    <th className="pb-3 pr-3 font-medium">Section</th>
                    <th className="pb-3 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleStudents.map((student) => (
                    <tr key={student.id} className="transition-colors duration-200 hover:bg-carbon-soft/50">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center border border-ivory/40 text-[10px] font-semibold">{student.initials}</span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{student.name}</p>
                            <p className="mt-1 truncate text-[10px] opacity-60">{student.id} · {student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 opacity-80">{student.birthDate}</td>
                      <td className="py-3 pr-3">{student.section}</td>
                      <td className="py-3 opacity-80">{student.enrolled}</td>
                    </tr>
                  ))}
                  {visibleStudents.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center opacity-60">No student records match “{query}”.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-5">
            <section id="performance" aria-label="Academic performance" className="carbon-panel p-5 shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7">
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
                      <tr key={record.student} className="transition-colors duration-200 hover:bg-carbon-soft/50">
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
                      <tr><td colSpan={5} className="py-5 text-center opacity-60">No performance records match “{query}”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="finance" aria-label="Financial administration" className="carbon-panel overflow-hidden shadow-[7px_7px_0_0_rgba(41,42,39,0.12)] transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between px-5 py-5 sm:px-6">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Financial administration</p>
                  <h2 className="font-serif text-2xl tracking-[-0.04em]">Student accounts</h2>
                </div>
                <Button type="button" className="carbon-inset h-9 px-3 text-xs font-medium transition-transform duration-200 hover:-translate-y-0.5 hover:bg-carbon">Payment history</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-ivory/40 px-5 py-4 sm:mx-6 sm:px-0">
                <div>
                  <p className="font-serif text-2xl">₱12,450</p>
                  <p className="mt-1 text-[10px] opacity-60">Collected this month</p>
                </div>
                <div className="border-l border-ivory/40 pl-4">
                  <p className="font-serif text-2xl">₱2,180</p>
                  <p className="mt-1 text-[10px] opacity-60">Outstanding fees</p>
                </div>
              </div>
              <ul className="px-5 sm:px-6">
                {visiblePayments.map((payment) => (
                  <li key={`${payment.student}-${payment.description}`} className="flex items-center gap-3 border-b border-ivory/30 py-3 transition-transform duration-200 hover:translate-x-1 last:border-0">
                    <span className="grid size-8 shrink-0 place-items-center border border-ivory/40"><Wallet size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium">{payment.student}</p>
                      <p className="mt-1 truncate text-[10px] opacity-60">{payment.description} · {payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{payment.amount}</p>
                      <p className="mt-1 text-[10px] opacity-60">{payment.status}</p>
                    </div>
                  </li>
                ))}
                {visiblePayments.length === 0 && (
                  <li className="py-5 text-center text-sm opacity-60">No payment records match “{query}”.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
        <footer className="mt-10 flex flex-col gap-3 border-t border-carbon pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-medium"><BookOpen size={14} />Academic office</span>
          <span className="flex items-center gap-2"><Clock3 size={13} />Academic records overview</span>
          <span>Tuesday · November 10, 2026</span>
        </footer>
      </main>
    </div>
  );
}
