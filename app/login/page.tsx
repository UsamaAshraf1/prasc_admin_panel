"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@prasc.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginAdmin(email, password);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Admin login">
        <div className="brand-mark">
          <ShieldCheck size={30} aria-hidden="true" />
        </div>
        <p className="eyebrow">PRASC Admin</p>
        <h1>Questionnaire dashboard</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email or username
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              placeholder="admin@prasc.com"
              readOnly
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="admin123"
              readOnly
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={isLoading}>
            {isLoading ? <LockKeyhole size={18} /> : <LogIn size={18} />}
            {isLoading ? "Signing in" : "Enter dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
