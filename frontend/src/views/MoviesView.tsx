import React, { useState, useEffect } from "react";
import { getMovies, createMovie, updateMovie } from "../services/api";
import { Movie } from "../types";
import { Film, CheckCircle2, Circle, AlertTriangle, Plus } from "lucide-react";

export const MoviesView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
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
    } catch (err: any) {
      setError("Failed to fetch movies");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createMovie({
        title,
        releaseYear: Number(releaseYear),
        runtime: Number(runtime),
        prerequisites: selectedPrereqs,
      });
      setTitle("");
      setSelectedPrereqs([]);
      await fetchMovies();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(`409 CIRCULAR_DEPENDENCY: ${err.response.data.message}`);
      } else {
        setError(err.response?.data?.message || "Failed to create movie");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleWatched = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      await fetchMovies();
    } catch (err: any) {
      setError("Failed to update watched status");
    }
  };

  const handlePrereqToggle = (id: string) => {
    setSelectedPrereqs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 font-bold">×</button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-red-500" /> Add MCU Movie
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Iron Man"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Release Year</label>
              <input
                type="number"
                required
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Runtime (1–300 mins)</label>
              <input
                type="number"
                required
                min={1}
                max={300}
                value={runtime}
                onChange={(e) => setRuntime(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Prerequisites (Watch These First)</label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              {movies.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handlePrereqToggle(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    selectedPrereqs.includes(m.id)
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {m.title}
                </button>
              ))}
              {movies.length === 0 && <span className="text-xs text-slate-500">No existing movies to depend on.</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-red-600/30"
          >
            {loading ? "Adding..." : "Add Movie"}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" /> MCU Movies ({movies.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition ${
                m.watched ? "bg-slate-950/40 border-emerald-900/50" : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{m.releaseYear} • {m.runtime} mins</p>
                </div>
                <button
                  onClick={() => toggleWatched(m)}
                  className="p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  {m.watched ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
              </div>

              {m.prerequisites.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.prerequisites.map((p) => (
                      <span key={p.id} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {p.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};