import React, { useState, useEffect } from "react";
import { getCinemas, createCinema, getBookingQuote } from "../services/api";
import { Cinema, BookingQuoteResult } from "../types";
import { Ticket, Building2, Plus, AlertCircle, CheckCircle } from "lucide-react";

export const BookingView: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState<number>(44);
  const [quote, setQuote] = useState<BookingQuoteResult | null>(null);
  const [newCinemaName, setNewCinemaName] = useState("");
  const [newBundleSizes, setNewBundleSizes] = useState("6, 9, 20");
  const [error, setError] = useState<string | null>(null);

  const fetchCinemas = async () => {
    try {
      const data = await getCinemas();
      setCinemas(data);
      if (data.length > 0 && !selectedCinemaId) {
        setSelectedCinemaId(data[0].id);
      }
    } catch (err) {
      setError("Failed to fetch cinemas");
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleCreateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bundles = newBundleSizes
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);

      await createCinema({ name: newCinemaName, bundleSizes: bundles });
      setNewCinemaName("");
      await fetchCinemas();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create cinema");
    }
  };

  const handleGetQuote = async () => {
    if (!selectedCinemaId) return;
    try {
      const res = await getBookingQuote(selectedCinemaId, groupSize);
      setQuote(res);
    } catch (err: any) {
      setError("Failed to calculate booking quote");
    }
  };

  useEffect(() => {
    if (selectedCinemaId && groupSize > 0) {
      handleGetQuote();
    }
  }, [selectedCinemaId, groupSize]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-500" /> Add Cinema
          </h2>
          <form onSubmit={handleCreateCinema} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Cinema Name</label>
              <input
                type="text"
                required
                value={newCinemaName}
                onChange={(e) => setNewCinemaName(e.target.value)}
                placeholder="e.g. Star Cineplex"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Bundle Sizes (Comma Separated)</label>
              <input
                type="text"
                required
                value={newBundleSizes}
                onChange={(e) => setNewBundleSizes(e.target.value)}
                placeholder="e.g. 2, 5 or 6, 9, 20"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition"
            >
              Add Cinema
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-500" /> Watch-Party Booking Quote
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Select Cinema</label>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Bundles: {c.bundleSizes.join(", ")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Group Size (1–10,000)</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {quote && (
            <div className="pt-4 border-t border-slate-800">
              {quote.possible ? (
                <div className="bg-slate-950/70 border border-emerald-900/60 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                      <span className="text-xs uppercase font-semibold text-emerald-400">Optimal Solution</span>
                      <h3 className="text-2xl font-bold text-white mt-0.5">{quote.summary}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {quote.breakdown.map((b) => (
                      <div key={b.size} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                        <span className="text-xs text-slate-400 block">{b.size} Seat Bundle</span>
                        <span className="text-lg font-bold text-white">{b.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-red-900/60 rounded-xl p-6 flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <span className="text-xs uppercase font-semibold text-red-400">Feasibility Result</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Not possible</h3>
                    <p className="text-xs text-slate-500 mt-1">No exact combination of bundles matches {groupSize} seats.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};