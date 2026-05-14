import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export type ContactRow = Record<string, unknown>;

export type ContactResult = {
  rows: ContactRow[];
  error?: string;
};

export const contactTable =
  process.env.NEXT_PUBLIC_CONTACT_TABLE?.trim() || "contact_messages";

export async function fetchContactMessages(): Promise<ContactResult> {
  if (!hasSupabaseConfig || !supabase) {
    return {
      rows: [],
      error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    };
  }

  const { data, error } = await supabase
    .from(contactTable)
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: data ?? [] };
}

export function formatContactValue(value: unknown, key?: string) {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "created_at" || key === "updated_at") return formatContactDate(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function formatContactHeader(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatContactDate(value: unknown) {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
