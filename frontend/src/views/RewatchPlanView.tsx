import React, { useState, useEffect } from "react";
import { getMovies, getRewatchOrder, updateMovie } from "../services/api";
import type { Movie, RewatchOrderResult } from "../types";
import { Clock, Calendar, CheckCircle2, Circle, ShieldCheck } from "lucide-react";

export const RewatchPlanView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [targetId, setTargetId] = useState<string>("");
  const [plan, setPlan] = useState<RewatchOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMovies().then((data) => {
      setMovies(data);
      if (data.length > 0) {
        const doomsday = data.find((m) => m.title.toLowerCase().includes("doomsday"));
        setTargetId(doomsday ? doomsday.id : data[0].id);
      }
    });
  }, []);

  const fetchPlan = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRewatchOrder(id);
      setPlan(data);
    } catch {
      setError("Failed to fetch rewatch plan from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchPlan(targetId);
    }
  }, [targetId]);

  const toggleWatched = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      if (targetId) fetchPlan(targetId);
    } catch {
      setError("Failed to update watched status");
    }
  };

  const progressPercent = plan && plan.totalCount > 0
    ? Math.round((plan.watchedCount / plan.totalCount) * 100)
    : 0;

  const targetMovie = movies.find((m) => m.id === targetId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div className="command-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#e62429" }}>Target Destination</span>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: "0.2rem" }}>
            Select Target MCU Premiere
          </h3>
        </div>

        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="select-field"
          style={{ maxWidth: "340px", fontWeight: 600 }}
        >
          {movies.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.releaseYear})
            </option>
          ))}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Calculating topological dependency order...</div>}
      {error && <div style={{ textAlign: "center", padding: "2rem", color: "#f87171" }}>{error}</div>}

      {plan && !loading && (
        <>
          <div className="stats-grid">
            <div className="metric-card" style={{ gridColumn: "span 2" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                    Rewatch Completion
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e62429" }}>{progressPercent}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#0b0f17", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "#e62429", borderRadius: "9999px" }} />
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
                  {plan.watchedCount} of {plan.totalCount} prerequisites completed
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: "rgba(212, 175, 55, 0.12)", color: "#d4af37" }}>
                <Clock style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Remaining Runtime</span>
                <h4 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
                  {plan.remainingRuntime} mins
                </h4>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {(plan.remainingRuntime / 60).toFixed(1)} hrs left
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <Calendar style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Required Movies</span>
                <h4 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", marginTop: "0.15rem" }}>
                  {plan.totalCount}
                </h4>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Topological Order</span>
              </div>
            </div>
          </div>

          <div className="command-card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>
              Prerequisite Watch Sequence for {targetMovie?.title}
            </h3>

            {plan.order.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <ShieldCheck style={{ width: "40px", height: "40px", color: "#10b981" }} />
                <span style={{ fontSize: "1rem", color: "#ffffff", fontWeight: 600 }}>Zero Prerequisites Required!</span>
                <p style={{ fontSize: "0.85rem", maxWidth: "420px" }}>
                  This movie does not depend on any prior titles. You are ready to watch it directly.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {plan.order.map((m, idx) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.25rem",
                      borderRadius: "10px",
                      backgroundColor: m.watched ? "rgba(7, 9, 14, 0.7)" : "#161d2d",
                      border: m.watched ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid #1e2638",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "#07090e",
                          color: "#94a3b8",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: m.watched ? "#94a3b8" : "#ffffff", textDecoration: m.watched ? "line-through" : "none" }}>
                          {m.title}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{m.releaseYear} • {m.runtime} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleWatched(m)}
                      style={{ background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: m.watched ? "#10b981" : "#64748b" }}
                    >
                      {m.watched ? <CheckCircle2 style={{ width: "20px", height: "20px" }} /> : <Circle style={{ width: "20px", height: "20px" }} />}
                      <span>{m.watched ? "Watched" : "Not Watched"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};