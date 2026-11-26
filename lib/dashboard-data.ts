import { apiClient } from "@/lib/api";

type ApiRecord = Record<string, unknown>;
export type EnrollmentStatus = "Enrolled" | "Drop Requested" | "Dropped";
export type AttendanceStatus = "Present" | "Absent" | "Late";

export interface DashboardProfile {
  id: string;
  name: string;
}

export interface DashboardStudent {
  id: string;
  name: string;
  sectionId: string | null;
}

export interface DashboardStudentAccount {
  id: string;
  username: string;
}

export interface DashboardSection {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  schedule: string;
  room: string;
  status?: EnrollmentStatus;
  enrollmentId?: string;
}

export interface DashboardEnrollment {
  id: string;
  studentId: string;
  student: string;
  sectionId: string;
  date: string;
  status: EnrollmentStatus;
  dropReason: string;
}

export interface DashboardAttendance {
  id: string;
  studentId: string;
  student: string;
  sectionId: string;
  section: string;
  date: string;
  status: AttendanceStatus;
}

export interface DashboardGrade {
  id: string;
  studentId: string;
  student: string;
  sectionId: string;
  section: string;
  tasks: string;
  attendance: string;
  exams: string;
  average: string;
}

export interface DashboardData {
  role: "student" | "professor";
  profile: DashboardProfile | null;
  sections: DashboardSection[];
  students: DashboardStudent[];
  studentAccounts: DashboardStudentAccount[];
  enrollments: DashboardEnrollment[];
  grades: DashboardGrade[];
  attendance: DashboardAttendance[];
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(record: ApiRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function rows(value: unknown, name: string): ApiRecord[] {
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw new Error(`The dashboard ${name} data was returned in an unexpected format.`);
  }
  return value;
}

function score(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 0 && value <= 1 ? value * 100 : value;
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(normalized)}%`;
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim().endsWith("%") ? value.trim() : `${value.trim()}%`;
  }
  return "—";
}

function status(value: string | null): EnrollmentStatus {
  if (value === "Dropped" || value === "Drop Requested") return value;
  return "Enrolled";
}

function attendanceStatus(value: string | null): AttendanceStatus {
  if (value === "Absent" || value === "Late") return value;
  return "Present";
}

function formatDate(month: string | null, day: string | null): string {
  if (!month || !day) return "Date not set";
  return `${month} ${day}`;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await apiClient<unknown>("/dashboard", { requiresAuth: true });
  if (!isRecord(response)) throw new Error("The dashboard endpoint returned an unexpected response.");

  const profileRecord = isRecord(response.profile) ? response.profile : null;
  const sectionRows = rows(response.sections, "sections");
  const studentRows = rows(response.students, "students");
  const studentAccountRows = rows(response.studentAccounts ?? [], "student accounts");
  const enrollmentRows = rows(response.enrollments, "enrollments");
  const attendanceRows = rows(response.attendance, "attendance");
  const gradeRows = rows(response.grades, "grades");

  const sections = sectionRows.map((record, index) => ({
    id: text(record, "section_id") ?? `section-${index}`,
    name: text(record, "section_name") ?? `Section ${index + 1}`,
    subject: text(record, "subject_name") ?? "Subject not assigned",
    teacher: text(record, "prof_name") ?? "Professor not assigned",
    schedule: text(record, "schedule_text", "sched") ?? "Schedule to be announced",
    room: text(record, "room") ?? "Room to be announced",
    status: record.enrollment_status ? status(text(record, "enrollment_status")) : undefined,
    enrollmentId: text(record, "enrollment_id") ?? undefined,
  }));
  const sectionNames = new Map(sections.map((section) => [section.id, `${section.subject} · ${section.name}`]));
  const students = studentRows.map((record, index) => ({
    id: text(record, "student_id") ?? `student-${index}`,
    name: text(record, "student_name") ?? `Student ${index + 1}`,
    sectionId: text(record, "section_id"),
  }));
  const studentAccounts = studentAccountRows.map((record, index) => ({
    id: text(record, "user_id", "id") ?? `account-${index}`,
    username: text(record, "username") ?? `Student account ${index + 1}`,
  }));
  const studentNames = new Map(students.map((student) => [student.id, student.name]));
  const enrollments = enrollmentRows.map((record, index) => {
    const studentId = text(record, "student_id") ?? "";
    return {
      id: text(record, "enrollment_id") ?? `enrollment-${index}`,
      studentId,
      student: text(record, "student_name") ?? studentNames.get(studentId) ?? `Student ${studentId}`,
      sectionId: text(record, "section_id") ?? "",
      date: text(record, "enrollment_date") ?? "—",
      status: status(text(record, "status")),
      dropReason: text(record, "drop_reason") ?? "",
    };
  });
  const attendance = attendanceRows.map((record, index) => {
    const studentId = text(record, "student_id") ?? "";
    const sectionId = text(record, "section_id") ?? "";
    const recordStatus = text(record, "status");
    return {
      id: text(record, "attendance_id") ?? `attendance-${index}`,
      studentId,
      student: text(record, "student_name") ?? studentNames.get(studentId) ?? `Student ${studentId}`,
      sectionId,
      section: text(record, "section_name") ?? sectionNames.get(sectionId) ?? "Section",
      date: text(record, "date") ?? formatDate(text(record, "attendance_month"), text(record, "attendance_day")),
      status: attendanceStatus(recordStatus),
    };
  });
  const grades = gradeRows.map((record, index) => {
    const studentId = text(record, "student_id") ?? "";
    const sectionId = text(record, "section_id") ?? "";
    return {
      id: text(record, "grade_id") ?? `grade-${index}`,
      studentId,
      student: text(record, "student_name") ?? studentNames.get(studentId) ?? `Student ${studentId}`,
      sectionId,
      section: text(record, "section_name", "subject_name") ?? sectionNames.get(sectionId) ?? "Section",
      tasks: score(record.PT_AVE),
      attendance: score(record.Attendance_ave),
      exams: score(record.exam_ave),
      average: score(record.gen_ave),
    };
  });

  return {
    role: response.role === "professor" ? "professor" : "student",
    profile: profileRecord
      ? { id: text(profileRecord, "id") ?? "", name: text(profileRecord, "name") ?? "Adali user" }
      : null,
    sections,
    students,
    studentAccounts,
    enrollments,
    grades,
    attendance,
  };
}
