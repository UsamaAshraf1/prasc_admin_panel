"use client";

import { hasSupabaseConfig, supabase } from "@/lib/supabase";

const AUTH_STORAGE_KEY = "prasc_admin_auth";

export type AdminUser = {
  email: string;
  mode: "supabase" | "dummy";
};

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeUser(user: AdminUser) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error("Enter any email/name and password to continue.");
  }

  if (hasSupabaseConfig && supabase && trimmedEmail.includes("@")) {
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword
    });

    if (!error) {
      const user = { email: trimmedEmail, mode: "supabase" as const };
      storeUser(user);
      return user;
    }
  }

  const user = { email: trimmedEmail, mode: "dummy" as const };
  storeUser(user);
  return user;
}
