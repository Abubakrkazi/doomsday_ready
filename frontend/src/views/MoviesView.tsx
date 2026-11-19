import React, { useState, useEffect } from "react";
import { getMovies, createMovie, updateMovie } from "../services/api";
import type { Movie } from "../types";
import { Film, CheckCircle2, Circle, AlertTriangle, Plus, Search, Edit3, X, Layers } from "lucide-react";

export const MoviesView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "watched" | "unwatched">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState(2026);
  const [runtime, setRuntime] = useState(120);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      setMovies(data);
    } catch {
      setError("Failed to fetch movies from database");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle("");
    setReleaseYear(2026);
    setRuntime(120);
    setSelectedPrereqs([]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setReleaseYear(movie.releaseYear);
    setRuntime(movie.runtime);
    setSelectedPrereqs(movie.prerequisites.map((p) => p.id));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, {
          title,
          releaseYear: Number(releaseYear),
          runtime: Number(runtime),
          prerequisites: selectedPrereqs,
        });
      } else {
        await createMovie({
          title,
          releaseYear: Number(releaseYear),
          runtime: Number(runtime),
          prerequisites: selectedPrereqs,
        });
      }
      setIsModalOpen(false);
      await fetchMovies();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(`409 CIRCULAR_DEPENDENCY: ${err.response.data.message}`);
      } else {
        setError(err.response?.data?.message || "Operation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleWatched = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      await fetchMovies();
    } catch {
      setError("Failed to update status");
    }
  };

  const handlePrereqToggle = (id: string) => {
    setSelectedPrereqs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredMovies = movies.filter((m) => {
    const match = m.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "watched") return match && m.watched;
    if (filter === "unwatched") return match && !m.watched;
    return match;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {error && (
        <div style={{ backgroundColor: "rgba(127, 29, 29, 0.7)", border: "1px solid #ef4444", padding: "1rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fecaca" }}>
            <AlertTriangle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
            <span style={{ fontSize: "0.9rem" }}>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={{ background: "none", color: "#fecaca", fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, maxWidth: "520px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search style={{ position: "absolute", left: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search movie catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.3rem" }}
            />
          </div>
          <select
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            className="select-field"
            style={{ width: "140px" }}
          >
            <option value="all">All Movies</option>
            <option value="watched">Watched</option>
            <option value="unwatched">Unwatched</option>
          </select>
        </div>

        <button className="btn-crimson" onClick={openAddModal}>
          <Plus style={{ width: "18px", height: "18px" }} /> Add MCU Movie
        </button>
      </div>

      <div className="cards-grid">
        {filteredMovies.map((m) => (
          <div key={m.id} className="command-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  height: "130px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #161d2d 0%, #07090e 100%)",
                  border: "1px solid #1e2638",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  position: "relative",
                }}
              >
                <Film style={{ width: "40px", height: "40px", color: "#334155" }} />
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.55rem",
                    borderRadius: "4px",
                    backgroundColor: m.watched ? "rgba(16, 185, 129, 0.18)" : "rgba(100, 116, 139, 0.25)",
                    color: m.watched ? "#34d399" : "#94a3b8",
                  }}
                >
                  {m.watched ? "WATCHED" : "UNWATCHED"}
                </span>
              </div>

              <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.3rem" }}>{m.title}</h4>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                {m.releaseYear} • {m.runtime} mins
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#d4af37", fontSize: "0.75rem", fontWeight: 600 }}>
                <Layers style={{ width: "14px", height: "14px" }} />
                <span>{m.prerequisites.length} prerequisite{m.prerequisites.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px solid #1e2638" }}>
              <button
                onClick={() => toggleWatched(m)}
                style={{ background: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: m.watched ? "#10b981" : "#94a3b8", cursor: "pointer" }}
              >
                {m.watched ? <CheckCircle2 style={{ width: "18px", height: "18px" }} /> : <Circle style={{ width: "18px", height: "18px" }} />}
                {m.watched ? "Watched" : "Mark Watched"}
              </button>

              <button
                onClick={() => openEditModal(m)}
                style={{ background: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
              >
                <Edit3 style={{ width: "15px", height: "15px" }} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e2638" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>
                {editingMovie ? "Edit MCU Movie" : "Add MCU Movie"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Captain America: The First Avenger"
                  className="input-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    Release Year
                  </label>
                  <input
                    type="number"
                    required
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    Runtime (1–300 mins)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={300}
                    value={runtime}
                    onChange={(e) => setRuntime(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Prerequisites (Watch These Before This Movie)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", maxHeight: "150px", overflowY: "auto", padding: "0.6rem", backgroundColor: "#0b0f17", borderRadius: "8px", border: "1px solid #1e2638" }}>
                  {movies
                    .filter((m) => !editingMovie || m.id !== editingMovie.id)
                    .map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handlePrereqToggle(m.id)}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "9999px",
                          border: selectedPrereqs.includes(m.id) ? "1px solid #e62429" : "1px solid #334155",
                          backgroundColor: selectedPrereqs.includes(m.id) ? "#e62429" : "#161d2d",
                          color: selectedPrereqs.includes(m.id) ? "#ffffff" : "#94a3b8",
                          cursor: "pointer",
                        }}
                      >
                        {m.title}
                      </button>
                    ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-crimson">
                  {loading ? "Processing..." : editingMovie ? "Update Movie" : "Save Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};