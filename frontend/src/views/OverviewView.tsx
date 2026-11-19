import React, { useState, useEffect } from "react";
import { getMovies, getCinemas, getRewatchOrder, getBookingQuote } from "../services/api";
import type { Movie, Cinema, RewatchOrderResult, BookingQuoteResult } from "../types";
import { Film, CheckCircle2, Clock, Building2, ArrowRight, Sparkles, Ticket, Shield } from "lucide-react";

interface OverviewViewProps {
  onNavigate: (tab: "movies" | "rewatch" | "booking") => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [plan, setPlan] = useState<RewatchOrderResult | null>(null);
  const [quote, setQuote] = useState<BookingQuoteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMovies(), getCinemas()])
      .then(async ([moviesData, cinemasData]) => {
        setMovies(moviesData);
        setCinemas(cinemasData);

        if (moviesData.length > 0) {
          const doomsday = moviesData.find((m) => m.title.toLowerCase().includes("doomsday")) || moviesData[0];
          try {
            const rewatchPlan = await getRewatchOrder(doomsday.id);
            setPlan(rewatchPlan);
          } catch {}
        }

        if (cinemasData.length > 0) {
          try {
            const quoteRes = await getBookingQuote(cinemasData[0].id, 44);
            setQuote(quoteRes);
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMovies = movies.length;
  const watchedMovies = movies.filter((m) => m.watched).length;
  const remainingMovies = totalMovies - watchedMovies;
  const progressPercent = plan && plan.totalCount > 0 ? Math.round((plan.watchedCount / plan.totalCount) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div
        style={{
          background: "radial-gradient(ellipse at top left, rgba(230, 36, 41, 0.22) 0%, rgba(15, 20, 31, 0.98) 75%)",
          border: "1px solid rgba(230, 36, 41, 0.35)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "680px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(230, 36, 41, 0.18)",
              border: "1px solid rgba(230, 36, 41, 0.3)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              marginBottom: "1.2rem",
            }}
          >
            <Sparkles style={{ width: "14px", height: "14px", color: "#d4af37" }} />
            MCU Rewatch Command Center
          </div>

          <h1 style={{ fontSize: "2.35rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "0.85rem" }}>
            Your Journey to Doomsday Starts Here.
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
            Plan your MCU rewatch, track your progress, and bring your watch party together.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn-crimson" onClick={() => onNavigate("rewatch")}>
              Build Rewatch Plan <ArrowRight style={{ width: "16px", height: "16px" }} />
            </button>
            <button className="btn-ghost" onClick={() => onNavigate("movies")}>
              Explore Movies
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <Film style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
              Total Movies
            </span>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
              {loading ? "..." : totalMovies}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <CheckCircle2 style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
              Watched Movies
            </span>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
              {loading ? "..." : watchedMovies}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "rgba(212, 175, 55, 0.12)", color: "#d4af37" }}>
            <Clock style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
              Remaining Movies
            </span>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
              {loading ? "..." : remainingMovies}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
            <Building2 style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
              Available Cinemas
            </span>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
              {loading ? "..." : cinemas.length}
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        <div className="command-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield style={{ width: "20px", height: "20px", color: "#e62429" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>Rewatch Progress</h3>
            </div>
            <button
              onClick={() => onNavigate("rewatch")}
              style={{ background: "none", color: "#e62429", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              Full Plan <ArrowRight style={{ width: "14px", height: "14px" }} />
            </button>
          </div>

          {plan ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Target: Avengers: Doomsday</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                  {plan.watchedCount} of {plan.totalCount} watched
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#0b0f17", borderRadius: "9999px", overflow: "hidden", marginBottom: "0.75rem" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "#e62429", borderRadius: "9999px" }} />
              </div>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {plan.remainingRuntime} minutes ({(plan.remainingRuntime / 60).toFixed(1)} hrs) remaining unwatched.
              </span>
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "1.5rem 0" }}>
              Loading rewatch telemetry...
            </div>
          )}
        </div>

        <div className="command-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Ticket style={{ width: "20px", height: "20px", color: "#d4af37" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>Opening Night Preview</h3>
            </div>
            <button
              onClick={() => onNavigate("booking")}
              style={{ background: "none", color: "#e62429", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              Book Venue <ArrowRight style={{ width: "14px", height: "14px" }} />
            </button>
          </div>

          {quote && cinemas.length > 0 ? (
            <div>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                Venue: {cinemas[0].name} • Group: 44 People
              </span>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginTop: "0.4rem", marginBottom: "0.4rem" }}>
                {quote.summary}
              </h4>
              <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>
                Exact combination found with zero empty seats.
              </span>
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "1.5rem 0" }}>
              Configure a cinema to see live booking quotes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};