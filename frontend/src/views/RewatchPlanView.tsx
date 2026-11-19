import React, { useState, useEffect } from "react";
import { getMovies, getRewatchOrder, updateMovie } from "../services/api";
import { Movie, RewatchOrderResult } from "../types";
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";

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
    } catch (err: any) {
      setError("Failed to compute rewatch plan");
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
    } catch (err: any) {
      setError("Failed to update watched status");
    }
  };

  const progressPercent = plan && plan.totalCount > 0
    ? Math.round((plan.watchedCount / plan.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Select Target Movie to Prepare For</label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full max-w-md bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
        >
          {movies.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.releaseYear})
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-slate-400 text-center py-8">Calculating optimal rewatch order...</div>}
      {error && <div className="text-red-400 text-center py-8">{error}</div>}

      {plan && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Rewatch Progress</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white">
                  {plan.watchedCount} of {plan.totalCount} watched
                </span>
                <span className="text-sm font-semibold text-red-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Remaining Watch Time</span>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-bold text-white">{plan.remainingRuntime} mins</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {(plan.remainingRuntime / 60).toFixed(1)} hours of unwatched content
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Prerequisites</span>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-bold text-white">{plan.totalCount} Movies</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Ordered topologically by dependencies</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Required Rewatch Order</h3>
            {plan.order.length === 0 ? (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <span>No prerequisites needed! You are ready to watch this movie directly.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {plan.order.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition ${
                      m.watched ? "bg-slate-950/60 border-emerald-900/40" : "bg-slate-800/40 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-500 w-6 text-center">#{idx + 1}</span>
                      <div>
                        <h4 className={`font-semibold ${m.watched ? "text-slate-400 line-through" : "text-white"}`}>
                          {m.title}
                        </h4>
                        <span className="text-xs text-slate-500">{m.runtime} mins</span>
                      </div>
                    </div>
                    <button onClick={() => toggleWatched(m)} className="p-1 rounded-lg">
                      {m.watched ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};