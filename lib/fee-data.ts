import { apiClient } from "@/lib/api";

type ApiFee = {
  fees_id?: unknown;
  amount?: unknown;
  trans_history?: unknown;
  created_at?: unknown;
};

export interface StudentFeeRecord {
  id: string;
  amount: number;
  history: string;
  date: string;
}

function isApiFee(value: unknown): value is ApiFee {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function fetchStudentFeeRecords(): Promise<StudentFeeRecord[]> {
  const response = await apiClient<unknown>("/fees/mine", { requiresAuth: true });
  if (!Array.isArray(response) || !response.every(isApiFee)) {
    throw new Error("Fee records were returned in an unexpected format.");
  }

  return response.map((record, index) => {
    const parsedAmount = typeof record.amount === "number" ? record.amount : Number(record.amount);
    return {
      id: typeof record.fees_id === "string" || typeof record.fees_id === "number" ? String(record.fees_id) : `fee-${index}`,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
      history: typeof record.trans_history === "string" && record.trans_history.trim() ? record.trans_history.trim() : "Fee record",
      date: typeof record.created_at === "string" ? record.created_at : "",
    };
  });
}
