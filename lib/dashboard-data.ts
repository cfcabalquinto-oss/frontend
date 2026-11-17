import { apiClient } from "@/lib/api";

type ApiRecord = Record<string, unknown>;

export interface DashboardStudent {
  id: string;
  name: string;
  birthDate: string;
  contact: string;
  section: string;
  enrolled: string;
}

export interface DashboardSection {
  id: string;
  name: string;
  teacher: string;
  subject: string;
}

export interface DashboardAttendance {
  id: string;
  student: string;
  section: string;
  date: string;
  status: string;
}

export interface DashboardGrade {
  id: string;
  student: string;
  section: string;
  tasks: string;
  attendance: string;
  exams: string;
  average: string;
}

export interface DashboardFee {
  id: string;
  student: string;
  description: string;
  amount: string;
  date: string;
}

export interface DashboardData {
  students: DashboardStudent[];
  sections: DashboardSection[];
  subjects: string[];
  professors: string[];
  attendance: DashboardAttendance[];
  grades: DashboardGrade[];
  fees: DashboardFee[];
  enrollmentCount: number;
  totalFees: number;
}

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, "");
}

function readValue(record: ApiRecord, ...keys: string[]): unknown {
  const normalizedKeys = new Set(keys.map(normalizeKey));
  const entry = Object.entries(record).find(([key]) => normalizedKeys.has(normalizeKey(key)));
  return entry?.[1];
}

function readText(record: ApiRecord, ...keys: string[]): string | null {
  const value = readValue(record, ...keys);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function readRelationText(
  record: ApiRecord,
  directKeys: string[],
  relationKey: string,
  relationNameKeys: string[],
): string | null {
  const directValue = readText(record, ...directKeys);
  if (directValue) return directValue;

  const relation = readValue(record, relationKey);
  return isApiRecord(relation) ? readText(relation, ...relationNameKeys) : null;
}

function getRows(value: unknown, resource: string): ApiRecord[] {
  let rows = value;

  for (let depth = 0; depth < 3 && isApiRecord(rows); depth += 1) {
    const wrappedRows = readValue(rows, "data", "items", "results");
    if (wrappedRows === undefined) break;
    rows = wrappedRows;
  }

  if (!Array.isArray(rows) || !rows.every(isApiRecord)) {
    throw new Error(`The ${resource} endpoint returned an unexpected response.`);
  }

  return rows;
}

function entityId(record: ApiRecord, keys: string[], fallback: string): string {
  return readText(record, ...keys) ?? fallback;
}

function formatScore(record: ApiRecord, ...keys: string[]): string {
  const value = readValue(record, ...keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    const score = value > 0 && value <= 1 ? value * 100 : value;
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(score)}%`;
  }

  if (typeof value === "string" && value.trim()) {
    const score = value.trim();
    return score.endsWith("%") ? score : `${score}%`;
  }

  return "—";
}

function formatAmount(record: ApiRecord): { display: string; numeric: number } {
  const value = readValue(record, "amount");
  if (typeof value === "number" && Number.isFinite(value)) {
    return {
      display: `₱${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}`,
      numeric: value,
    };
  }

  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value.replace(/[₱,\s]/g, ""));
    return {
      display: value.trim().startsWith("₱") ? value.trim() : `₱${value.trim()}`,
      numeric: Number.isFinite(numeric) ? numeric : 0,
    };
  }

  return { display: "—", numeric: 0 };
}

function displayDate(value: string | null): string {
  if (!value) return "—";
  return value;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [studentResponse, sectionResponse, professorResponse, subjectResponse, attendanceResponse, gradeResponse, feeResponse, enrollmentResponse] =
    await Promise.all([
      apiClient<unknown>("/students", { requiresAuth: true }),
      apiClient<unknown>("/sections", { requiresAuth: true }),
      apiClient<unknown>("/professors", { requiresAuth: true }),
      apiClient<unknown>("/subjects", { requiresAuth: true }),
      apiClient<unknown>("/attendance", { requiresAuth: true }),
      apiClient<unknown>("/grades", { requiresAuth: true }),
      apiClient<unknown>("/fees", { requiresAuth: true }),
      apiClient<unknown>("/enrollments", { requiresAuth: true }),
    ]);

  const studentRows = getRows(studentResponse, "students");
  const sectionRows = getRows(sectionResponse, "sections");
  const professorRows = getRows(professorResponse, "professors");
  const subjectRows = getRows(subjectResponse, "subjects");
  const attendanceRows = getRows(attendanceResponse, "attendance");
  const gradeRows = getRows(gradeResponse, "grades");
  const feeRows = getRows(feeResponse, "fees");
  const enrollmentRows = getRows(enrollmentResponse, "enrollments");

  const subjectsById = new Map(
    subjectRows.map((subject, index) => [
      entityId(subject, ["subject_id", "id"], `subject-${index}`),
      readText(subject, "subject_name", "name") ?? "Subject not assigned",
    ]),
  );
  const professorsById = new Map(
    professorRows.map((professor, index) => [
      entityId(professor, ["teacher_id", "professor_id", "id"], `professor-${index}`),
      {
        name: readText(professor, "prof_name", "professor_name", "name") ?? "Teacher not assigned",
        subjectId: readText(professor, "subject_id", "subjectId"),
        subject: readRelationText(professor, ["subject_name"], "subject", ["subject_name", "name"]),
      },
    ]),
  );
  const sections = sectionRows.map((section, index) => {
    const teacherId = readText(section, "teacher_id", "teacherId", "professor_id");
    const professor = teacherId ? professorsById.get(teacherId) : undefined;
    const subjectId = readText(section, "subject_id", "subjectId") ?? professor?.subjectId;

    return {
      id: entityId(section, ["section_id", "id"], `section-${index}`),
      name: readText(section, "section_name", "name") ?? `Section ${index + 1}`,
      teacher:
        readRelationText(section, ["prof_name", "teacher_name", "professor_name"], "teacher", ["prof_name", "name"]) ??
        professor?.name ??
        "Teacher not assigned",
      subject:
        readRelationText(section, ["subject_name"], "subject", ["subject_name", "name"]) ??
        professor?.subject ??
        (subjectId ? subjectsById.get(subjectId) : undefined) ??
        "Subject not assigned",
    };
  });
  const sectionsById = new Map(
    sectionRows.map((section, index) => [
      entityId(section, ["section_id", "id"], `section-${index}`),
      readText(section, "section_name", "name") ?? `Section ${index + 1}`,
    ]),
  );

  const enrollmentDates = new Map<string, string>();
  for (const enrollment of enrollmentRows) {
    const studentId = readText(enrollment, "student_id", "studentId");
    const enrollmentDate = readText(enrollment, "enrollment_date", "enrollmentDate");
    if (!studentId || !enrollmentDate) continue;

    const existingDate = enrollmentDates.get(studentId);
    if (!existingDate || enrollmentDate > existingDate) {
      enrollmentDates.set(studentId, enrollmentDate);
    }

  }

  const studentsById = new Map<string, string>();
  const studentSectionsById = new Map<string, string>();
  const students = studentRows.map((student, index) => {
    const id = entityId(student, ["student_id", "id"], `student-${index}`);
    const name = readRelationText(student, ["student_name", "name", "full_name"], "student", ["student_name", "name"]) ?? `Student ${id}`;
    const sectionId = readText(student, "section_id", "sectionId");
    const section =
      readRelationText(student, ["section_name"], "section", ["section_name", "name"]) ??
      (sectionId ? sectionsById.get(sectionId) : undefined) ??
      "Section not assigned";

    studentsById.set(id, name);
    studentSectionsById.set(id, section);

    return {
      id,
      name,
      birthDate: displayDate(readText(student, "dateofbirth", "date_of_birth", "birth_date", "birthDate")),
      contact: readText(student, "contact_num", "contact_number", "phone", "email") ?? "—",
      section,
      enrolled: displayDate(enrollmentDates.get(id) ?? null),
    };
  });

  const attendance = attendanceRows.map((record, index) => {
    const studentId = readText(record, "student_id", "studentId");
    const sectionId = readText(record, "section_id", "sectionId");
    const month = readText(record, "attendance_month", "attendanceMonth");
    const day = readText(record, "attendance_day", "attendanceDay");

    return {
      id: entityId(record, ["attendance_id", "id"], `attendance-${index}`),
      student:
        readRelationText(record, ["student_name"], "student", ["student_name", "name"]) ??
        (studentId ? studentsById.get(studentId) : undefined) ??
        (studentId ? `Student ${studentId}` : "Unknown student"),
      section:
        readRelationText(record, ["section_name"], "section", ["section_name", "name"]) ??
        (sectionId ? sectionsById.get(sectionId) : undefined) ??
        (studentId ? studentSectionsById.get(studentId) : undefined) ??
        "Section not assigned",
      date:
        readText(record, "date", "attendance_date") ??
        (month && day ? `${month} ${day}` : displayDate(readText(record, "created_at", "createdAt"))),
      status: readText(record, "status", "attendance_status", "attendanceStatus") ?? "Recorded",
    };
  });

  const grades = gradeRows.map((grade, index) => {
    const studentId = readText(grade, "student_id", "studentId");
    const sectionId = readText(grade, "section_id", "sectionId");

    return {
      id: entityId(grade, ["grade_id", "id"], `grade-${index}`),
      student:
        readRelationText(grade, ["student_name"], "student", ["student_name", "name"]) ??
        (studentId ? studentsById.get(studentId) : undefined) ??
        (studentId ? `Student ${studentId}` : "Unknown student"),
      section:
        readRelationText(grade, ["section_name"], "section", ["section_name", "name"]) ??
        (sectionId ? sectionsById.get(sectionId) : undefined) ??
        (studentId ? studentSectionsById.get(studentId) : undefined) ??
        "Section not assigned",
      tasks: formatScore(grade, "pt_ave", "tasks", "task_average"),
      attendance: formatScore(grade, "attendance_ave", "attendance_average"),
      exams: formatScore(grade, "exam_ave", "exam_average"),
      average: formatScore(grade, "gen_ave", "general_average", "average"),
    };
  });

  let totalFees = 0;
  const fees = feeRows.map((fee, index) => {
    const studentId = readText(fee, "student_id", "studentId");
    const amount = formatAmount(fee);
    totalFees += amount.numeric;

    return {
      id: entityId(fee, ["fees_id", "fee_id", "id"], `fee-${index}`),
      student:
        readRelationText(fee, ["student_name"], "student", ["student_name", "name"]) ??
        (studentId ? studentsById.get(studentId) : undefined) ??
        (studentId ? `Student ${studentId}` : "Unknown student"),
      description: readText(fee, "trans_history", "transaction_history", "description") ?? "Fee record",
      amount: amount.display,
      date: displayDate(readText(fee, "created_at", "createdAt", "date")),
    };
  });

  return {
    students,
    sections,
    subjects: subjectRows.map((subject, index) => readText(subject, "subject_name", "name") ?? `Subject ${index + 1}`),
    professors: professorRows.map((professor, index) => readText(professor, "prof_name", "professor_name", "name") ?? `Professor ${index + 1}`),
    attendance,
    grades,
    fees,
    enrollmentCount: enrollmentRows.length,
    totalFees,
  };
}
