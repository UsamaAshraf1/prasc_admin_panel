"use client";

import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export type AdminUser = {
  email: string;
  id: string;
};

function getAuthClient() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password) {
    throw new Error("Enter your admin email and password.");
  }

  const client = getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: trimmedEmail,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.email) {
    throw new Error("Supabase did not return a valid user.");
  }

  return {
    email: data.user.email,
    id: data.user.id
  };
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  return {
    email: data.user.email,
    id: data.user.id
  };
}

export async function logoutAdmin() {
  if (hasSupabaseConfig && supabase) {
    await supabase.auth.signOut();
  }
}
