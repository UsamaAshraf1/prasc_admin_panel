import { categories, type Category } from "@/lib/categories";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export type AnswerRow = Record<string, unknown>;

export type AnswerSession = {
  sessionId: string;
  displayName: string;
  submittedAt: string;
  rows: AnswerRow[];
};

export type CategoryResult = {
  category: Category;
  rows: AnswerRow[];
  error?: string;
};

const SESSION_KEYS = ["sessionId", "session_id", "sessionid", "session"];
const DATE_KEYS = ["created_at", "createdAt", "submitted_at", "updated_at"];

export function getSessionId(row: AnswerRow) {
  const key = SESSION_KEYS.find((candidate) => row[candidate] !== undefined);
  return key ? String(row[key] ?? "Unknown session") : "Unknown session";
}

export function getSubmittedAt(row: AnswerRow) {
  const key = DATE_KEYS.find((candidate) => row[candidate] !== undefined);
  if (!key || !row[key]) return "";

  const date = new Date(String(row[key]));
  if (Number.isNaN(date.getTime())) return String(row[key]);

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function getQuestionId(row: AnswerRow) {
  return String(row.question_id ?? row.questionId ?? "Unknown question");
}

export function getAnswerValue(row: AnswerRow) {
  return row.value ?? row.answer ?? row.response ?? null;
}

export function getDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => getDisplayValue(item)).filter(Boolean).join(", ");
  if (typeof value !== "object") return String(value);

  const entries = Object.values(value as Record<string, unknown>);
  const firstValue = entries.find((entry) => entry !== null && entry !== undefined && entry !== "");

  return firstValue === undefined ? JSON.stringify(value) : getDisplayValue(firstValue);
}

export function getAnswerFields(row: AnswerRow) {
  const hiddenKeys = new Set([...SESSION_KEYS, ...DATE_KEYS, "id", "user_id"]);

  return Object.entries(row).filter(([key]) => !hiddenKeys.has(key));
}

export function groupRowsBySession(rows: AnswerRow[]): AnswerSession[] {
  const sessions = new Map<string, AnswerRow[]>();

  rows.forEach((row) => {
    const sessionId = getSessionId(row);
    sessions.set(sessionId, [...(sessions.get(sessionId) ?? []), row]);
  });

  return Array.from(sessions.entries()).map(([sessionId, sessionRows]) => {
    const sortedRows = [...sessionRows].sort((left, right) =>
      getQuestionId(left).localeCompare(getQuestionId(right), undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

    return {
      sessionId,
      displayName: getDisplayValue(getAnswerValue(sortedRows[0] ?? {})),
      submittedAt: getSubmittedAt(sessionRows[0] ?? {}),
      rows: sortedRows
    };
  });
}

export async function fetchCategoryAnswers(category: Category): Promise<CategoryResult> {
  if (!hasSupabaseConfig || !supabase) {
    return {
      category,
      rows: [],
      error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    };
  }

  const { data, error } = await supabase
    .from(category.table)
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    return { category, rows: [], error: error.message };
  }

  return { category, rows: data ?? [] };
}

export async function fetchAllAnswers(): Promise<CategoryResult[]> {
  return Promise.all(categories.map((category) => fetchCategoryAnswers(category)));
}
