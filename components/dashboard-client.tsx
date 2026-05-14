"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  Contact,
  Database,
  LogOut,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { getCurrentUser, logoutAdmin, type AdminUser } from "@/lib/auth";
import {
  fetchAllAnswers,
  getAnswerValue,
  getQuestionId,
  groupRowsBySession,
  type AnswerRow,
  type AnswerSession,
  type CategoryResult,
} from "@/lib/answers";
import {
  contactTable,
  fetchContactMessages,
  formatContactHeader,
  formatContactValue,
  type ContactResult,
  type ContactRow,
} from "@/lib/contact";

const CONTACT_VIEW_ID = "contact-us";

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [contactResult, setContactResult] = useState<ContactResult>({
    rows: [],
  });
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [activeView, setActiveView] = useState(categories[0].id);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboardData() {
    setIsLoading(true);
    const [nextResults, nextContactResult] = await Promise.all([
      fetchAllAnswers(),
      fetchContactMessages(),
    ]);
    setResults(nextResults);
    setContactResult(nextContactResult);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      const currentUser = await getCurrentUser();
      if (!isMounted) return;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      await loadDashboardData();
    }

    void initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const activeResult = useMemo(
    () => results.find((result) => result.category.id === activeCategory),
    [activeCategory, results],
  );

  const activeSessions = useMemo(
    () => groupRowsBySession(activeResult?.rows ?? []),
    [activeResult],
  );

  const filteredSessions = useMemo(() => {
    const sessions = activeSessions;
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return sessions;

    return sessions.filter((session) =>
      JSON.stringify(session.rows).toLowerCase().includes(normalizedQuery),
    );
  }, [activeSessions, query]);

  const selectedSessionGroup = useMemo(() => {
    if (!filteredSessions.length) return null;
    return (
      filteredSessions.find(
        (session) => session.sessionId === selectedSession,
      ) ?? filteredSessions[0]
    );
  }, [filteredSessions, selectedSession]);

  const totalResponses = results.reduce(
    (total, result) => total + result.rows.length,
    0,
  );
  const totalSessions = results.reduce(
    (total, result) => total + groupRowsBySession(result.rows).length,
    0,
  );
  const categoriesWithData = results.filter(
    (result) => result.rows.length > 0,
  ).length;
  const isContactView = activeView === CONTACT_VIEW_ID;

  async function handleLogout() {
    await logoutAdmin();
    router.replace("/login");
  }

  if (!user) {
    return <main className="loading-screen">Opening dashboard...</main>;
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar" aria-label="Questionnaire categories">
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <Database size={22} aria-hidden="true" />
          </div>
          <div>
            <p>PRASC</p>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="category-nav">
          {categories.map((category) => {
            const Icon = category.icon;
            const categoryRows =
              results.find((result) => result.category.id === category.id)
                ?.rows ?? [];
            const count = groupRowsBySession(categoryRows).length;

            return (
              <button
                key={category.id}
                className={
                  !isContactView && activeCategory === category.id
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveView(category.id);
                  setActiveCategory(category.id);
                  setSelectedSession("");
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{category.label}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
          <button
            className={isContactView ? "active" : ""}
            onClick={() => {
              setActiveView(CONTACT_VIEW_ID);
              setSelectedSession("");
            }}
          >
            <Contact size={18} aria-hidden="true" />
            <span>Contact Us</span>
            <strong>{contactResult.rows.length}</strong>
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </aside>

      <section className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {isContactView ? "Contact messages" : "Questionnaire answers"}
            </p>
            <h1>
              {isContactView
                ? "Contact Us"
                : (activeResult?.category.label ?? "Dashboard")}
            </h1>
          </div>
          <div className="user-pill">
            <UserRound size={18} aria-hidden="true" />
            <span>{user.email}</span>
          </div>
        </header>

        <section
          className={`${isContactView ? "hide_metrics" : "metrics"}`}
          aria-label="Dashboard metrics"
        >
          {/* {isContactView ? (
            <>
              <Metric label="Contact messages" value={contactResult.rows.length} />
              <Metric label="Current table" value={contactTable} compact />
              <Metric label="Status" value={contactResult.error ? "Needs attention" : "Loaded"} compact />
            </>
          ) : ( */}
          <>
            <Metric label="Total sessions" value={totalSessions} />
            <Metric label="Total answers" value={totalResponses} />
            <Metric label="Categories with data" value={categoriesWithData} />
          </>
          {/* )} */}
        </section>

        {isContactView ? (
          <ContactTable
            result={contactResult}
            isLoading={isLoading}
            onRefresh={loadDashboardData}
          />
        ) : (
          <section className="workspace">
            <div className="responses-panel">
              <div className="panel-header">
                <div>
                  <h2>Sessions</h2>
                  <p>{activeResult?.category.description}</p>
                </div>
                <button
                  className="icon-button"
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  title="Refresh answers"
                >
                  <RefreshCw size={18} aria-hidden="true" />
                </button>
              </div>

              <label className="search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sessions and answers"
                />
              </label>

              {activeResult?.error ? (
                <div className="notice error">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{activeResult.error}</span>
                </div>
              ) : null}

              <div className="session-list">
                {isLoading ? (
                  <p className="empty-state">
                    Loading questionnaire answers...
                  </p>
                ) : null}
                {!isLoading && !filteredSessions.length ? (
                  <p className="empty-state">
                    No answers found for this category.
                  </p>
                ) : null}
                {filteredSessions.map((session) => {
                  return (
                    <button
                      key={session.sessionId}
                      className={
                        selectedSessionGroup?.sessionId === session.sessionId
                          ? "selected"
                          : ""
                      }
                      onClick={() => setSelectedSession(session.sessionId)}
                    >
                      {session.displayName ? (
                        <span className="session-name">
                          {session.displayName}
                        </span>
                      ) : null}
                      <span>{session.sessionId}</span>
                      <strong className="question-count">
                        {session.rows.length} answers
                      </strong>
                      {session.submittedAt ? (
                        <small>
                          <CalendarClock size={14} aria-hidden="true" />
                          {session.submittedAt}
                        </small>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnswerDetail session={selectedSessionGroup} />
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "metric compact" : "metric"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AnswerDetail({ session }: { session: AnswerSession | null }) {
  if (!session) {
    return (
      <article className="answer-detail empty">
        <h2>Answer details</h2>
        <p>
          Select a session to view every saved question and answer for that
          session ID.
        </p>
      </article>
    );
  }

  return (
    <article className="answer-detail">
      <div className="panel-header">
        <div>
          <h2>Session answers</h2>
          <p>{session.sessionId}</p>
        </div>
        {session.submittedAt ? <time>{session.submittedAt}</time> : null}
      </div>

      <div className="answer-grid">
        {session.rows.map((row) => (
          <section key={getQuestionId(row)} className="answer-item">
            <div className="answer-item-header">
              <h3>{getQuestionId(row)}</h3>
              {row.confidence !== null && row.confidence !== undefined ? (
                <span>Confidence: {String(row.confidence)}</span>
              ) : null}
            </div>
            <pre>{formatValue(getAnswerValue(row))}</pre>
            <div className="answer-meta">
              {getSubmittedText(row) ? (
                <span>Saved: {getSubmittedText(row)}</span>
              ) : null}
              {row.prasc_opt_in !== null && row.prasc_opt_in !== undefined ? (
                <span>PRASC opt-in: {String(row.prasc_opt_in)}</span>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function ContactTable({
  result,
  isLoading,
  onRefresh,
}: {
  result: ContactResult;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const columns = getContactColumns(result.rows);

  return (
    <section className="contact-panel">
      <div className="panel-header">
        <div>
          <h2>Contact submissions</h2>
          <p>Messages submitted through the website contact form.</p>
        </div>
        <button
          className="icon-button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh contact messages"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>

      {result.error ? (
        <div className="notice error">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{result.error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <p className="empty-state">Loading contact messages...</p>
      ) : null}
      {!isLoading && !result.rows.length ? (
        <p className="empty-state">No contact messages found.</p>
      ) : null}

      {result.rows.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{formatContactHeader(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr key={getContactRowKey(row, index)}>
                  {columns.map((column) => (
                    <td key={column}>
                      {formatContactValue(row[column], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function getContactColumns(rows: ContactRow[]) {
  const preferredColumns = [
    "name",
    "full_name",
    "email",
    "phone",
    "subject",
    "message",
  ];
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const preferred = preferredColumns.filter((column) => keys.includes(column));
  const trailing = ["created_at", "updated_at"].filter((column) =>
    keys.includes(column),
  );
  const remaining = keys.filter(
    (column) =>
      !preferredColumns.includes(column) &&
      !trailing.includes(column) &&
      column !== "id",
  );

  return [...preferred, ...remaining, ...trailing];
}

function getContactRowKey(row: ContactRow, index: number) {
  return String(row.id ?? row.created_at ?? index);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "No answer";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function getSubmittedText(row: AnswerRow) {
  const value = row.updated_at ?? row.created_at;
  if (!value) return "";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
