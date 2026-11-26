"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  GraduationCap,
  LogOut,
  Pencil,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens, getUserRole } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  fetchDashboardData,
  type DashboardData,
  type DashboardSection,
  type DashboardStudent,
  type EnrollmentStatus,
} from "@/lib/dashboard-data";

const cardClass = "carbon-panel rounded-2xl p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-6";
const controlClass = "carbon-inset min-h-11 w-full rounded-xl px-3 py-2.5 text-base text-[#f5f5f7] outline-none transition focus-visible:border-[#d9470a]/70 focus-visible:ring-2 focus-visible:ring-[#d9470a]/30 sm:text-sm";
const orangeButtonClass = "auth-signin-button min-h-11 rounded-xl px-4 font-semibold transition-transform hover:-translate-y-0.5 disabled:translate-y-0";

function formatToday(): string {
  const today = new Date();
  const localOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - localOffset).toISOString().slice(0, 10);
}

function formatDateLabel(date: string): string {
  if (!date) return "Date not set";
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(parsed);
}

function statusClass(status: EnrollmentStatus): string {
  if (status === "Dropped") return "border-white/10 bg-white/[0.04] text-[#92929a]";
  if (status === "Drop Requested") return "border-amber-300/20 bg-amber-300/10 text-amber-200";
  return "border-emerald-300/20 bg-emerald-300/10 text-emerald-200";
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass(status)}`}>{status}</span>;
}

function PanelHeading({
  eyebrow,
  title,
  detail,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d9470a]/20 bg-[#d9470a]/10 text-[#ff9a55]">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4a4ac]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em] sm:text-2xl">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[#92929a] sm:text-sm">{detail}</p>}
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-[#92929a]">{children}</p>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; isError?: boolean } | null>(null);
  const [linkStudentId, setLinkStudentId] = useState("");
  const [linkBirthDate, setLinkBirthDate] = useState("");
  const [addStudentBySection, setAddStudentBySection] = useState<Record<string, string>>({});
  const [sectionDialogTarget, setSectionDialogTarget] = useState<DashboardSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ subject_name: "", section_name: "", schedule_text: "", room: "" });
  const [newStudentSection, setNewStudentSection] = useState<DashboardSection | null>(null);
  const [newStudentForm, setNewStudentForm] = useState({ student_name: "", dateofbirth: "", contact_num: "", user_account_id: "" });
  const [gradeSectionId, setGradeSectionId] = useState("");
  const [gradeStudentId, setGradeStudentId] = useState("");
  const [gradeFields, setGradeFields] = useState({ tasks: "", attendance: "", exams: "", average: "" });
  const [attendanceSectionId, setAttendanceSectionId] = useState("");
  const [attendanceStudentId, setAttendanceStudentId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [dropTarget, setDropTarget] = useState<{ section: DashboardSection; enrollmentId: string } | null>(null);
  const [dropReason, setDropReason] = useState("");
  const dropDialog = useRef<HTMLDialogElement>(null);
  const sectionDialog = useRef<HTMLDialogElement>(null);
  const studentDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setAttendanceDate(formatToday());
  }, []);

  useEffect(() => {
    if (isChecking) return;
    let active = true;
    fetchDashboardData()
      .then((data) => {
        if (active) {
          setDashboardData(data);
          setDataError(null);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setDataError(error instanceof Error ? error.message : "Unable to load the dashboard.");
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isChecking, retryCount]);

  const role = dashboardData?.role ?? getUserRole();
  const sections = dashboardData?.sections ?? [];
  const students = dashboardData?.students ?? [];
  const enrollments = dashboardData?.enrollments ?? [];
  const grades = dashboardData?.grades ?? [];
  const attendance = dashboardData?.attendance ?? [];

  const activeRoster = (sectionId: string) => enrollments.filter(
    (enrollment) => enrollment.sectionId === sectionId && enrollment.status === "Enrolled",
  );
  const gradeForSelection = useMemo(
    () => grades.find((grade) => grade.sectionId === gradeSectionId && grade.studentId === gradeStudentId),
    [grades, gradeSectionId, gradeStudentId],
  );

  useEffect(() => {
    if (!sections.length) return;
    setGradeSectionId((current) => current || sections[0].id);
    setAttendanceSectionId((current) => current || sections[0].id);
  }, [sections]);

  useEffect(() => {
    if (!gradeForSelection) {
      setGradeFields({ tasks: "", attendance: "", exams: "", average: "" });
      return;
    }
    const asNumber = (value: string) => value === "—" ? "" : value.replace(/%$/, "");
    setGradeFields({
      tasks: asNumber(gradeForSelection.tasks),
      attendance: asNumber(gradeForSelection.attendance),
      exams: asNumber(gradeForSelection.exams),
      average: asNumber(gradeForSelection.average),
    });
  }, [gradeForSelection]);

  const refreshData = async () => {
    setDashboardData(await fetchDashboardData());
  };

  const runAction = async (key: string, successMessage: string, action: () => Promise<unknown>) => {
    setBusyAction(key);
    setNotice(null);
    try {
      await action();
      await refreshData();
      setNotice({ message: successMessage });
      return true;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That change could not be saved.", isError: true });
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  const logout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  const openCreateSection = () => {
    setSectionDialogTarget(null);
    setSectionForm({ subject_name: "", section_name: "", schedule_text: "", room: "" });
    sectionDialog.current?.showModal();
  };

  const openEditSection = (section: DashboardSection) => {
    setSectionDialogTarget(section);
    setSectionForm({
      subject_name: section.subject === "Subject not assigned" ? "" : section.subject,
      section_name: section.name,
      schedule_text: section.schedule === "Schedule to be announced" ? "" : section.schedule,
      room: section.room === "Room to be announced" ? "" : section.room,
    });
    sectionDialog.current?.showModal();
  };

  const saveSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = sectionDialogTarget;
    const endpoint = target ? `/sections/${target.id}` : "/sections";
    void runAction(target ? `edit-section-${target.id}` : "create-section", target ? "Course and section details updated." : "Subject and teaching section added.", () => apiClient(endpoint, {
      method: target ? "PUT" : "POST",
      requiresAuth: true,
      body: JSON.stringify(sectionForm),
    })).then((succeeded) => {
      if (!succeeded) return;
      sectionDialog.current?.close();
      setSectionDialogTarget(null);
    });
  };

  const openNewStudent = (section: DashboardSection) => {
    setNewStudentSection(section);
    setNewStudentForm({ student_name: "", dateofbirth: "", contact_num: "", user_account_id: "" });
    studentDialog.current?.showModal();
  };

  const saveNewStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newStudentSection) return;
    const target = newStudentSection;
    void runAction(`create-student-${target.id}`, "Student profile created and enrolled in the section.", () => apiClient("/enrollments/with-student", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify({
        section_id: Number(target.id),
        enrollment_date: formatToday(),
        student_name: newStudentForm.student_name,
        dateofbirth: newStudentForm.dateofbirth,
        contact_num: newStudentForm.contact_num,
        user_account_id: newStudentForm.user_account_id ? Number(newStudentForm.user_account_id) : null,
      }),
    })).then((succeeded) => {
      if (!succeeded) return;
      studentDialog.current?.close();
      setNewStudentSection(null);
    });
  };

  const submitLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction("link-profile", "Your student profile is linked.", () => apiClient("/students/link-account", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify({ student_id: Number(linkStudentId), dateofbirth: linkBirthDate }),
    }));
  };

  const addStudent = (event: FormEvent<HTMLFormElement>, section: DashboardSection) => {
    event.preventDefault();
    const studentId = addStudentBySection[section.id];
    if (!studentId) return;
    void runAction(`add-${section.id}`, "Student added to the section.", () => apiClient("/enrollments", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify({ enrollment_date: formatToday(), student_id: Number(studentId), section_id: Number(section.id) }),
    }));
  };

  const markDropped = (enrollmentId: string) => {
    void runAction(`drop-${enrollmentId}`, "Enrollment status updated to Dropped.", () => apiClient(`/enrollments/${enrollmentId}`, {
      method: "PUT",
      requiresAuth: true,
      body: JSON.stringify({ status: "Dropped" }),
    }));
  };

  const saveGrade = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const activeStudent = activeRoster(gradeSectionId).some((student) => student.studentId === gradeStudentId);
    if (!gradeSectionId || !gradeStudentId || !activeStudent) {
      setNotice({ message: "Choose an enrolled student in this section first.", isError: true });
      return;
    }
    const values = {
      PT_AVE: Number(gradeFields.tasks),
      Attendance_ave: Number(gradeFields.attendance),
      exam_ave: Number(gradeFields.exams),
      gen_ave: Number(gradeFields.average),
    };
    const existingGrade = gradeForSelection;
    void runAction("save-grade", existingGrade ? "Grade changes saved." : "Grade added.", () => apiClient(
      existingGrade ? `/grades/${existingGrade.id}` : "/grades",
      {
        method: existingGrade ? "PUT" : "POST",
        requiresAuth: true,
        body: JSON.stringify(existingGrade ? values : { ...values, student_id: Number(gradeStudentId), section_id: Number(gradeSectionId) }),
      },
    ));
  };

  const saveAttendance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const activeStudent = activeRoster(attendanceSectionId).some((student) => student.studentId === attendanceStudentId);
    if (!attendanceSectionId || !attendanceStudentId || !activeStudent) {
      setNotice({ message: "Choose an enrolled student in this section first.", isError: true });
      return;
    }
    const selectedDate = new Date(`${attendanceDate}T12:00:00`);
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(selectedDate);
    const day = selectedDate.getDate();
    const label = formatDateLabel(attendanceDate);
    const existingRecord = attendance.find((record) =>
      record.sectionId === attendanceSectionId && record.studentId === attendanceStudentId && record.date === label,
    );
    const values = { attendance_month: month, attendance_day: day, status: attendanceStatus };
    void runAction("save-attendance", existingRecord ? "Attendance record updated." : "Attendance logged.", () => apiClient(
      existingRecord ? `/attendance/${existingRecord.id}` : "/attendance",
      {
        method: existingRecord ? "PUT" : "POST",
        requiresAuth: true,
        body: JSON.stringify(existingRecord ? values : {
          ...values,
          student_id: Number(attendanceStudentId),
          section_id: Number(attendanceSectionId),
        }),
      },
    ));
  };

  const openDropDialog = (section: DashboardSection) => {
    if (!section.enrollmentId) return;
    setDropTarget({ section, enrollmentId: section.enrollmentId });
    setDropReason("");
    dropDialog.current?.showModal();
  };

  const requestDrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dropTarget) return;
    const target = dropTarget;
    void runAction(`request-drop-${target.enrollmentId}`, "Drop request sent to your professor.", () => apiClient(
      `/enrollments/${target.enrollmentId}/drop-request`,
      { method: "POST", requiresAuth: true, body: JSON.stringify({ reason: dropReason.trim() }) },
    )).then((succeeded) => {
      if (!succeeded) return;
      dropDialog.current?.close();
      setDropTarget(null);
    });
  };

  if (isChecking || isLoading) {
    return <div className="dashboard-theme flex min-h-screen items-center justify-center"><p role="status" className="text-sm text-[#b8b8c0]">{isChecking ? "Verifying session..." : "Loading your dashboard..."}</p></div>;
  }

  if (dataError) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center px-4">
        <section className={`${cardClass} max-w-lg text-center`}>
          <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-[#b8b8c0]">{dataError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" className={orangeButtonClass} onClick={() => { setDataError(null); setIsLoading(true); setRetryCount((count) => count + 1); }}>Try again</Button>
            <Button type="button" variant="outline" onClick={logout} className="carbon-inset min-h-11 rounded-xl px-4">Log out</Button>
          </div>
        </section>
      </div>
    );
  }

  if (!dashboardData) return null;

  const studentAverage = grades
    .filter((grade) => grade.average !== "—")
    .map((grade) => Number(grade.average.replace(/[^\d.]/g, "")))
    .filter(Number.isFinite);
  const overallAverage = studentAverage.length
    ? `${(studentAverage.reduce((total, value) => total + value, 0) / studentAverage.length).toFixed(1)}%`
    : "—";
  const presentCount = attendance.filter((record) => record.status === "Present").length;
  const absentCount = attendance.filter((record) => record.status === "Absent").length;
  const lateCount = attendance.filter((record) => record.status === "Late").length;
  const attendanceRate = attendance.length ? `${Math.round((presentCount / attendance.length) * 100)}%` : "—";
  const currentProfessorSections = sections;

  return (
    <div className="dashboard-theme min-h-screen px-4 pb-12 sm:px-8 lg:pl-28">
      <aside className="carbon-panel fixed inset-y-6 left-6 z-20 hidden w-[72px] flex-col items-center rounded-2xl py-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] lg:flex">
        <Link href="/" aria-label="Adali home" className="mb-7 grid size-9 grid-cols-2 place-content-center gap-1 rounded-xl bg-[#d9470a] p-2">
          <span className="size-1.5 rounded-full bg-white" /><span className="size-1.5 rounded-full bg-white/75" />
          <span className="size-1.5 rounded-full bg-white/75" /><span className="size-1.5 rounded-full bg-white" />
        </Link>
        <nav aria-label="Dashboard sections" className="flex flex-col gap-3">
          <a href="#schedule" title="Academic schedule" aria-label="Academic schedule" className="grid size-11 place-items-center rounded-xl bg-[#c93e08] text-white shadow-[0_8px_24px_rgba(201,62,8,0.22)]"><CalendarDays size={19} /></a>
          <Link href="/dashboard/records" title="Academic performance and fees" aria-label="Academic performance and fees" className="grid size-11 place-items-center rounded-xl text-[#92929a] transition hover:bg-[#1a1a1d] hover:text-white"><BookOpen size={19} /></Link>
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
            <span className="hidden truncate text-sm text-[#b8b8c0] sm:inline">{role === "professor" ? "Professor dashboard" : "Student dashboard"}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="carbon-inset inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium text-[#c7c7ce] sm:text-xs">
              {role === "professor" ? <GraduationCap size={14} className="text-[#ff9a55]" /> : <UserRound size={14} className="text-[#ff9a55]" />}
              {role === "professor" ? "Professor" : "Student"}
            </span>
            <span className="hidden max-w-40 truncate text-sm text-[#a4a4ac] md:inline">{dashboardData.profile?.name ?? "Adali user"}</span>
            <Button type="button" variant="outline" aria-label="Log out" onClick={logout} className="carbon-inset h-10 rounded-xl px-3 text-xs sm:text-sm"><LogOut size={15} /><span className="hidden sm:inline">Log out</span></Button>
          </div>
        </header>

        {notice && <p role={notice.isError ? "alert" : "status"} aria-live={notice.isError ? "assertive" : "polite"} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.isError ? "border-red-300/20 bg-red-400/10 text-red-200" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"}`}>{notice.message}</p>}

        {role === "professor" ? (
          <>
            <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">Teaching workspace</p>
                <h1 className="text-3xl font-bold tracking-[-0.055em] sm:text-4xl">Good day, {dashboardData.profile?.name?.split(" ")[0] ?? "Professor"}</h1>
                <p className="mt-2 max-w-2xl text-sm text-[#a4a4ac]">Your classes, gradebook, and attendance are together in one place.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="carbon-inset rounded-xl px-3 py-2.5">{sections.length} sections</span>
                <span className="carbon-inset rounded-xl px-3 py-2.5">{enrollments.filter((item) => item.status === "Enrolled").length} students</span>
              </div>
            </section>

            <section id="courses" className="mb-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#92929a]">Your teaching load</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Subjects & sections</h2></div>
                <Button type="button" onClick={openCreateSection} className={orangeButtonClass}><Plus size={16} />Add subject & section</Button>
              </div>
              {currentProfessorSections.length ? (
                <div className="grid items-start gap-4 xl:grid-cols-2">
                  {currentProfessorSections.map((section) => {
                    const roster = enrollments.filter((item) => item.sectionId === section.id);
                    const eligibleStudents = students.filter((student) => !roster.some((item) => item.studentId === student.id && item.status !== "Dropped"));
                    return (
                      <article key={section.id} className={`${cardClass} min-w-0`}>
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d9470a]/10 text-[#ff9a55]"><BookOpen size={18} /></span>
                            <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] text-[#92929a]">{section.name}</p><h3 className="mt-1 truncate text-lg font-bold">{section.subject}</h3><p className="mt-1 text-xs text-[#a4a4ac]">{section.schedule} <span className="px-1 text-white/20">·</span> {section.room}</p></div>
                          </div>
                          <div className="flex items-center gap-2"><span className="carbon-inset rounded-full px-3 py-1.5 text-xs text-[#c7c7ce]">{roster.filter((item) => item.status !== "Dropped").length} active</span><Button type="button" variant="outline" onClick={() => openEditSection(section)} className="carbon-inset min-h-9 rounded-lg px-3 text-xs"><Pencil size={14} />Edit</Button></div>
                        </div>
                        <div className="mb-4 border-t border-white/10 pt-3">
                          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#dedee3]"><Users size={14} className="text-[#ff9a55]" /> Enrolled students</h4>
                          {roster.length ? <ul className="divide-y divide-white/[0.06]">
                            {roster.map((enrollment) => (
                              <li key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                <div className="min-w-0"><p className={`truncate text-sm font-medium ${enrollment.status === "Dropped" ? "text-[#92929a] line-through" : "text-[#f5f5f7]"}`}>{enrollment.student}</p>{enrollment.dropReason && enrollment.status === "Drop Requested" && <p className="mt-1 text-xs text-[#a4a4ac]">Reason: {enrollment.dropReason}</p>}</div>
                                <div className="flex items-center gap-2"><StatusBadge status={enrollment.status} />{enrollment.status !== "Dropped" && <Button type="button" variant="outline" disabled={busyAction === `drop-${enrollment.id}`} onClick={() => markDropped(enrollment.id)} className="carbon-inset min-h-9 rounded-lg px-3 text-xs">{busyAction === `drop-${enrollment.id}` ? "Saving…" : enrollment.status === "Drop Requested" ? "Approve drop" : "Mark dropped"}</Button>}</div>
                              </li>
                            ))}
                          </ul> : <EmptyState>No students are enrolled in this section yet.</EmptyState>}
                        </div>
                        <form aria-label={`Add a student to ${section.subject} ${section.name}`} onSubmit={(event) => addStudent(event, section)} className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
                          <label className="sr-only" htmlFor={`student-${section.id}`}>Choose a student to add</label>
                          <select id={`student-${section.id}`} name="student_id" required value={addStudentBySection[section.id] ?? ""} onChange={(event) => setAddStudentBySection((current) => ({ ...current, [section.id]: event.target.value }))} className={`${controlClass} min-w-0 flex-1`}>
                            <option value="" className="bg-[#101011]">{eligibleStudents.length ? "Select a student to enroll" : "No existing students available"}</option>
                            {eligibleStudents.map((student) => <option key={student.id} value={student.id} className="bg-[#101011]">{student.name} · #{student.id}</option>)}
                          </select>
                          <Button type="submit" disabled={busyAction === `add-${section.id}` || eligibleStudents.length === 0} className={`${orangeButtonClass} sm:min-w-36`}><Plus size={16} />{busyAction === `add-${section.id}` ? "Adding…" : eligibleStudents.length ? "Add student" : "No students left"}</Button>
                        </form>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><p className="text-xs text-[#92929a]">Create a student profile and enroll them directly in this section.</p><Button type="button" variant="outline" onClick={() => openNewStudent(section)} className="carbon-inset min-h-10 rounded-xl px-3 text-xs"><UserRound size={15} />Create student profile</Button></div>
                      </article>
                    );
                  })}
                </div>
              ) : <div className={cardClass}><EmptyState>No teaching sections are assigned to this professor account yet.</EmptyState></div>}
            </section>

            <div className="mb-6 grid items-start gap-5 xl:grid-cols-2">
              <section className={cardClass}>
                <PanelHeading eyebrow="Gradebook" title="Grades management" detail="Add a grade or edit a student’s current marks." icon={GraduationCap} />
                {sections.length ? <form aria-label="Grades management form" onSubmit={saveGrade} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Section<select name="section_id" required value={gradeSectionId} onChange={(event) => { setGradeSectionId(event.target.value); setGradeStudentId(""); }} className={controlClass}>{sections.map((section) => <option key={section.id} value={section.id} className="bg-[#101011]">{section.subject} · {section.name}</option>)}</select></label>
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Enrolled student<select name="student_id" required value={gradeStudentId} onChange={(event) => setGradeStudentId(event.target.value)} className={controlClass}><option value="" className="bg-[#101011]">Select student</option>{activeRoster(gradeSectionId).map((item) => <option key={item.studentId} value={item.studentId} className="bg-[#101011]">{item.student}</option>)}</select></label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["tasks", "Tasks average"], ["attendance", "Attendance average"], ["exams", "Exam average"], ["average", "Overall grade"],
                    ] as const).map(([field, label]) => <label key={field} className="space-y-1.5 text-xs text-[#b8b8c0]">{label}<input name={field} type="number" min="0" max="100" step="0.01" required value={gradeFields[field]} onChange={(event) => setGradeFields((current) => ({ ...current, [field]: event.target.value }))} className={controlClass} placeholder="0–100" /></label>)}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#92929a]">{gradeForSelection ? "Editing the selected student's grade." : "Dropped students are excluded from grade entry."}</p><Button type="submit" disabled={busyAction === "save-grade" || !gradeStudentId} className={orangeButtonClass}>{busyAction === "save-grade" ? "Saving…" : gradeForSelection ? "Save grade" : "Add grade"}</Button></div>
                </form> : <EmptyState>Add a teaching section before recording grades.</EmptyState>}
              </section>

              <section className={cardClass}>
                <PanelHeading eyebrow="Class register" title="Attendance management" detail="Record present, absent, or late by date and section." icon={ClipboardCheck} />
                {sections.length ? <form aria-label="Attendance management form" onSubmit={saveAttendance} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Section<select name="section_id" required value={attendanceSectionId} onChange={(event) => { setAttendanceSectionId(event.target.value); setAttendanceStudentId(""); }} className={controlClass}>{sections.map((section) => <option key={section.id} value={section.id} className="bg-[#101011]">{section.subject} · {section.name}</option>)}</select></label>
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Enrolled student<select name="student_id" required value={attendanceStudentId} onChange={(event) => setAttendanceStudentId(event.target.value)} className={controlClass}><option value="" className="bg-[#101011]">Select student</option>{activeRoster(attendanceSectionId).map((item) => <option key={item.studentId} value={item.studentId} className="bg-[#101011]">{item.student}</option>)}</select></label>
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Class date<input name="date" type="date" required value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className={controlClass} /></label>
                    <label className="space-y-1.5 text-xs text-[#b8b8c0]">Status<select name="status" value={attendanceStatus} onChange={(event) => setAttendanceStatus(event.target.value)} className={controlClass}><option className="bg-[#101011]">Present</option><option className="bg-[#101011]">Absent</option><option className="bg-[#101011]">Late</option></select></label>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#92929a]">Saving the same student, section, and date updates the existing record.</p><Button type="submit" disabled={busyAction === "save-attendance" || !attendanceStudentId} className={orangeButtonClass}>{busyAction === "save-attendance" ? "Saving…" : "Save attendance"}</Button></div>
                </form> : <EmptyState>Add a teaching section before recording attendance.</EmptyState>}
              </section>
            </div>

            <section id="schedule" className={cardClass}>
              <PanelHeading eyebrow="Weekly overview" title="Academic scheduling" detail="Your teaching days, class times, rooms, and sections." icon={CalendarDays} />
              {sections.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{sections.map((section) => <li key={section.id} className="carbon-inset flex min-w-0 gap-3 rounded-xl p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#d9470a]/10 text-[#ff9a55]"><CalendarDays size={16} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{section.subject}</p><p className="mt-1 text-xs text-[#a4a4ac]">{section.name}</p><p className="mt-2 text-xs text-[#c7c7ce]">{section.schedule} · {section.room}</p></div></li>)}</ul> : <EmptyState>No schedule is available yet.</EmptyState>}
            </section>
          </>
        ) : !dashboardData.profile ? (
          <section className={`${cardClass} mx-auto mt-10 max-w-xl`}>
            <PanelHeading eyebrow="Student account" title="Connect your student record" detail="Use the student ID and birth date already stored by your school to link this account." icon={UserRound} />
            <form aria-label="Link student profile" onSubmit={submitLink} className="space-y-4">
              <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Student ID<input name="student_id" inputMode="numeric" required value={linkStudentId} onChange={(event) => setLinkStudentId(event.target.value)} className={controlClass} /></label>
              <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Date of birth<input name="dateofbirth" type="date" required value={linkBirthDate} onChange={(event) => setLinkBirthDate(event.target.value)} className={controlClass} /></label>
              <p className="text-xs text-[#92929a]">If the details do not match, ask your school administrator to check your student record.</p>
              <Button type="submit" disabled={busyAction === "link-profile"} className={`${orangeButtonClass} w-full`}>{busyAction === "link-profile" ? "Connecting…" : "Connect student record"}</Button>
            </form>
          </section>
        ) : (
          <>
            <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">Your learning overview</p><h1 className="text-3xl font-bold tracking-[-0.055em] sm:text-4xl">Welcome back, {dashboardData.profile.name.split(" ")[0]}</h1><p className="mt-2 text-sm text-[#a4a4ac]">Your classes, progress, and attendance at a glance.</p></div>
              <span className="carbon-inset rounded-xl px-3 py-2.5 text-xs text-[#c7c7ce]">{sections.filter((section) => section.status !== "Dropped").length} current subjects</span>
            </section>

            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Current average", value: overallAverage, icon: GraduationCap },
                { label: "Attendance rate", value: attendanceRate, icon: ClipboardCheck },
                { label: "Enrolled subjects", value: sections.filter((section) => section.status === "Enrolled").length, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => <article key={label} className="carbon-panel rounded-2xl p-5"><span className="grid size-9 place-items-center rounded-xl bg-[#d9470a]/10 text-[#ff9a55]"><Icon size={17} /></span><p className="mt-4 text-3xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#92929a]">{label}</p></article>)}
            </div>

            <div className="mb-5 grid items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <section id="schedule" className={cardClass}>
                <PanelHeading eyebrow="This semester" title="Academic scheduling" detail="Your timetable with section, day, time, room, and professor." icon={CalendarDays} />
                {sections.some((section) => section.status !== "Dropped") ? <ul className="space-y-2">{sections.filter((section) => section.status !== "Dropped").map((section) => <li key={section.id} className="carbon-inset flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{section.subject}</p><p className="mt-1 text-xs text-[#a4a4ac]">{section.name} · {section.teacher}</p></div><div className="text-right text-xs text-[#c7c7ce]"><p>{section.schedule}</p><p className="mt-1 text-[#92929a]">{section.room}</p></div></li>)}</ul> : <EmptyState>Your class schedule will appear here once you are enrolled.</EmptyState>}
              </section>

              <section className={cardClass}>
                <PanelHeading eyebrow="Your progress" title="Academic performance" detail="Current marks across your enrolled subjects." icon={GraduationCap} />
                {grades.length ? <ul className="divide-y divide-white/[0.07]">{grades.map((grade) => <li key={grade.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{grade.section}</p><p className="mt-1 text-xs text-[#92929a]">Tasks {grade.tasks} · Attendance {grade.attendance} · Exam {grade.exams}</p></div><span className="rounded-xl bg-[#d9470a]/10 px-3 py-2 text-sm font-bold text-[#ff9a55]">{grade.average}</span></li>)}</ul> : <EmptyState>Grades have not been posted yet.</EmptyState>}
              </section>
            </div>

            <section className={`${cardClass} mb-5`}>
              <PanelHeading eyebrow="Class register" title="Attendance record" detail="Attendance summaries and recent records by subject." icon={ClipboardCheck} />
              <div className="mb-5 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/[0.08] bg-[#0b0b0c] py-3 text-center">
                {[{ label: "Present", value: presentCount }, { label: "Absent", value: absentCount }, { label: "Late", value: lateCount }].map((item) => <div key={item.label}><p className="text-xl font-bold">{item.value}</p><p className="mt-1 text-[11px] text-[#92929a]">{item.label}</p></div>)}
              </div>
              {sections.length > 0 && <div className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{sections.map((section) => {
                const subjectRecords = attendance.filter((record) => record.sectionId === section.id);
                const subjectPresent = subjectRecords.filter((record) => record.status === "Present").length;
                const subjectRate = subjectRecords.length ? Math.round((subjectPresent / subjectRecords.length) * 100) : null;
                return <div key={section.id} className="carbon-inset rounded-xl p-3.5"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold">{section.subject}</p><span className="text-xs font-semibold text-[#ff9a55]">{subjectRate === null ? "—" : `${subjectRate}%`}</span></div><p className="mt-2 text-[11px] text-[#92929a]">Present {subjectPresent} · Absent {subjectRecords.filter((record) => record.status === "Absent").length} · Late {subjectRecords.filter((record) => record.status === "Late").length}</p></div>;
              })}</div>}
              {attendance.length ? <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{attendance.slice(0, 9).map((record) => <li key={record.id} className="carbon-inset flex items-center justify-between gap-3 rounded-xl px-3.5 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{record.section}</p><p className="mt-1 text-xs text-[#92929a]">{record.date}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] ${record.status === "Present" ? "bg-emerald-300/10 text-emerald-200" : record.status === "Late" ? "bg-amber-300/10 text-amber-200" : "bg-red-300/10 text-red-200"}`}>{record.status}</span></li>)}</ul> : <EmptyState>No attendance records are available yet.</EmptyState>}
            </section>

            <section id="subjects" className="mb-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#92929a]">Your classes</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Enrolled subjects</h2></div><span className="text-xs text-[#92929a]">Classmates and enrollment status</span></div>
              {sections.length ? <div className="grid items-start gap-4 xl:grid-cols-2">
                {sections.map((section) => {
                  const classmates = students.filter((student) => student.sectionId === section.id && student.id !== dashboardData.profile?.id);
                  const canRequestDrop = section.status === "Enrolled" && Boolean(section.enrollmentId);
                  return (
                    <article key={section.id} className={cardClass}>
                      <div className="mb-4 flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] text-[#92929a]">{section.name}</p><h3 className="mt-1 truncate text-lg font-bold">{section.subject}</h3><p className="mt-1 text-xs text-[#a4a4ac]">{section.schedule} · {section.room} · {section.teacher}</p></div>{section.status && <StatusBadge status={section.status} />}</div>
                      <div className="border-t border-white/10 pt-4"><h4 className="mb-3 flex items-center gap-2 text-xs font-semibold"><Users size={14} className="text-[#ff9a55]" /> Classmates <span className="text-[#92929a]">({classmates.length})</span></h4>{classmates.length ? <ul className="flex flex-wrap gap-2">{classmates.map((student: DashboardStudent) => <li key={student.id} className="carbon-inset rounded-full px-3 py-1.5 text-xs text-[#c7c7ce]">{student.name}</li>)}</ul> : <p className="text-xs text-[#92929a]">No classmates are listed in this section yet.</p>}</div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs text-[#92929a]">{section.status === "Drop Requested" ? "Waiting for your professor’s approval." : section.status === "Dropped" ? "This subject is no longer active." : "Need to leave this subject?"}</span><Button type="button" variant="outline" disabled={!canRequestDrop || busyAction === `request-drop-${section.enrollmentId}`} onClick={() => openDropDialog(section)} className="carbon-inset min-h-10 rounded-xl px-3 text-xs">{section.status === "Drop Requested" ? "Request pending" : section.status === "Dropped" ? "Dropped" : "Request to drop"}</Button></div>
                    </article>
                  );
                })}
              </div> : <div className={cardClass}><EmptyState>You are not enrolled in any subjects yet.</EmptyState></div>}
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-[#777780]">Adali · {role === "professor" ? "Teaching workspace" : "Student workspace"} <ArrowUpRight size={13} className="ml-1 inline" /></footer>
      </main>

      <dialog ref={sectionDialog} aria-labelledby="section-editor-title" className="m-auto w-[min(100%-2rem,36rem)] rounded-2xl border border-white/10 bg-[#101011] p-0 text-[#f5f5f7] shadow-[0_25px_100px_rgba(0,0,0,0.7)] backdrop:bg-black/75">
        <form aria-labelledby="section-editor-title" onSubmit={saveSection} className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">Teaching setup</p><h2 id="section-editor-title" className="mt-1 text-xl font-bold">{sectionDialogTarget ? "Edit subject & section" : "Add subject & section"}</h2><p className="mt-1 text-sm text-[#a4a4ac]">Set the class details that appear on your professor and student dashboards.</p></div><button type="button" aria-label="Close section form" onClick={() => { sectionDialog.current?.close(); setSectionDialogTarget(null); }} className="grid size-9 shrink-0 place-items-center rounded-lg text-[#a4a4ac] transition hover:bg-white/5 hover:text-white"><X size={17} /></button></div>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Subject name<input autoFocus name="subject_name" required maxLength={120} value={sectionForm.subject_name} onChange={(event) => setSectionForm((current) => ({ ...current, subject_name: event.target.value }))} className={controlClass} placeholder="e.g. Mathematics" /></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Section / course group<input name="section_name" required maxLength={120} value={sectionForm.section_name} onChange={(event) => setSectionForm((current) => ({ ...current, section_name: event.target.value }))} className={controlClass} placeholder="e.g. Grade 7-A" /></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Days and time <span className="text-[#777780]">(optional)</span><input name="schedule_text" maxLength={160} value={sectionForm.schedule_text} onChange={(event) => setSectionForm((current) => ({ ...current, schedule_text: event.target.value }))} className={controlClass} placeholder="e.g. Mon & Wed · 9:00–10:30 AM" /></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Room <span className="text-[#777780]">(optional)</span><input name="room" maxLength={100} value={sectionForm.room} onChange={(event) => setSectionForm((current) => ({ ...current, room: event.target.value }))} className={controlClass} placeholder="e.g. Room 204" /></label>
          </div>
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { sectionDialog.current?.close(); setSectionDialogTarget(null); }} className="carbon-inset min-h-11 rounded-xl px-4">Cancel</Button><Button type="submit" disabled={busyAction === "create-section" || Boolean(sectionDialogTarget && busyAction === `edit-section-${sectionDialogTarget.id}`)} className={orangeButtonClass}>{busyAction === "create-section" || Boolean(sectionDialogTarget && busyAction === `edit-section-${sectionDialogTarget.id}`) ? "Saving…" : sectionDialogTarget ? "Save changes" : "Add course"}</Button></div>
        </form>
      </dialog>

      <dialog ref={studentDialog} aria-labelledby="new-student-title" className="m-auto w-[min(100%-2rem,32rem)] rounded-2xl border border-white/10 bg-[#101011] p-0 text-[#f5f5f7] shadow-[0_25px_100px_rgba(0,0,0,0.7)] backdrop:bg-black/75">
        <form aria-labelledby="new-student-title" onSubmit={saveNewStudent} className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">New enrollment</p><h2 id="new-student-title" className="mt-1 text-xl font-bold">Add a student to {newStudentSection?.subject ?? "this section"}</h2><p className="mt-1 text-sm text-[#a4a4ac]">This creates a student profile and enrolls it in {newStudentSection?.name ?? "the selected section"}.</p></div><button type="button" aria-label="Close student form" onClick={() => { studentDialog.current?.close(); setNewStudentSection(null); }} className="grid size-9 shrink-0 place-items-center rounded-lg text-[#a4a4ac] transition hover:bg-white/5 hover:text-white"><X size={17} /></button></div>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Student login <span className="text-[#777780]">(optional)</span><select name="user_account_id" value={newStudentForm.user_account_id} onChange={(event) => setNewStudentForm((current) => ({ ...current, user_account_id: event.target.value }))} className={controlClass}><option value="" className="bg-[#101011]">Create profile without linking a login</option>{dashboardData.studentAccounts.map((account) => <option key={account.id} value={account.id} className="bg-[#101011]">{account.username}</option>)}</select></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Student full name<input autoFocus name="student_name" required maxLength={120} value={newStudentForm.student_name} onChange={(event) => setNewStudentForm((current) => ({ ...current, student_name: event.target.value }))} className={controlClass} /></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Date of birth<input name="dateofbirth" type="date" required value={newStudentForm.dateofbirth} onChange={(event) => setNewStudentForm((current) => ({ ...current, dateofbirth: event.target.value }))} className={controlClass} /></label>
            <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Contact number <span className="text-[#777780]">(optional)</span><input name="contact_num" type="tel" maxLength={40} value={newStudentForm.contact_num} onChange={(event) => setNewStudentForm((current) => ({ ...current, contact_num: event.target.value }))} className={controlClass} /></label>
            <p className="text-xs text-[#92929a]">Choose a login to link it immediately. If you leave it unlinked, the student can connect later using their student ID and birth date.</p>
          </div>
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { studentDialog.current?.close(); setNewStudentSection(null); }} className="carbon-inset min-h-11 rounded-xl px-4">Cancel</Button><Button type="submit" disabled={busyAction === `create-student-${newStudentSection?.id}`} className={orangeButtonClass}>{busyAction === `create-student-${newStudentSection?.id}` ? "Adding…" : "Create & enroll"}</Button></div>
        </form>
      </dialog>

      <dialog ref={dropDialog} aria-labelledby="drop-title" className="m-auto w-[min(100%-2rem,32rem)] rounded-2xl border border-white/10 bg-[#101011] p-0 text-[#f5f5f7] shadow-[0_25px_100px_rgba(0,0,0,0.7)] backdrop:bg-black/75">
        <form aria-labelledby="drop-title" onSubmit={requestDrop} className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9a55]">Enrollment request</p><h2 id="drop-title" className="mt-1 text-xl font-bold">Request to drop {dropTarget?.section.subject ?? "this subject"}?</h2></div><button type="button" aria-label="Close drop request" onClick={() => { dropDialog.current?.close(); setDropTarget(null); }} className="grid size-9 shrink-0 place-items-center rounded-lg text-[#a4a4ac] transition hover:bg-white/5 hover:text-white"><X size={17} /></button></div>
          <p className="mb-4 text-sm text-[#a4a4ac]">Your enrollment stays active until your professor reviews the request.</p>
          <label className="block space-y-1.5 text-xs text-[#b8b8c0]">Reason <span className="text-[#777780]">(optional)</span><textarea name="reason" maxLength={500} rows={3} value={dropReason} onChange={(event) => setDropReason(event.target.value)} className={`${controlClass} min-h-24 resize-y`} placeholder="Add a short note for your professor" /></label>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" autoFocus onClick={() => { dropDialog.current?.close(); setDropTarget(null); }} className="carbon-inset min-h-11 rounded-xl px-4">Cancel</Button><Button type="submit" disabled={busyAction === `request-drop-${dropTarget?.enrollmentId}`} className={orangeButtonClass}><Check size={16} />{busyAction === `request-drop-${dropTarget?.enrollmentId}` ? "Sending…" : "Confirm request"}</Button></div>
        </form>
      </dialog>
    </div>
  );
}
