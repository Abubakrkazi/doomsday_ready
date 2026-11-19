import React, { useState, useEffect } from "react";
import { getCinemas, createCinema, getBookingQuote } from "../services/api";
import type { Cinema, BookingQuoteResult } from "../types";
import { Plus, CheckCircle, AlertCircle, Users, X } from "lucide-react";

export const BookingView: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState<number>(44);
  const [quote, setQuote] = useState<BookingQuoteResult | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
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
    } catch {
      setError("Failed to fetch cinemas from backend");
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
      setIsAddOpen(false);
      setNewCinemaName("");
      await fetchCinemas();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create cinema venue");
    }
  };

  useEffect(() => {
    if (selectedCinemaId && groupSize > 0) {
      getBookingQuote(selectedCinemaId, groupSize)
        .then((res) => setQuote(res))
        .catch(() => setError("Failed to compute booking quote"));
    }
  }, [selectedCinemaId, groupSize]);

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {error && (
        <div style={{ backgroundColor: "rgba(127, 29, 29, 0.7)", border: "1px solid #ef4444", padding: "1rem", borderRadius: "10px", color: "#fecaca" }}>
          {error}
        </div>
      )}

      <div className="command-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#e62429" }}>Watch Party Command</span>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", marginTop: "0.2rem" }}>
            Opening Night Seat Allocation Calculator
          </h3>
        </div>

        <button className="btn-ghost" onClick={() => setIsAddOpen(true)}>
          <Plus style={{ width: "16px", height: "16px" }} /> Add Cinema Venue
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="command-card">
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>Booking Parameters</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Select Cinema
              </label>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="select-field"
              >
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCinema && (
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem", display: "block" }}>
                  Available Bundle Sizes: {selectedCinema.bundleSizes.join(", ")} seats
                </span>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Group Size (1–10,000 Seats)
              </label>
              <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <Users style={{ position: "absolute", left: "12px", width: "16px", height: "16px", color: "#64748b" }} />
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="input-field"
                  style={{ paddingLeft: "2.3rem" }}
                />
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                Quick Test Benchmark Presets
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[6, 11, 44, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGroupSize(num)}
                    style={{
                      padding: "0.35rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      backgroundColor: groupSize === num ? "#e62429" : "#161d2d",
                      color: groupSize === num ? "#ffffff" : "#94a3b8",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {num} Seats
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="command-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {quote ? (
            quote.possible ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle style={{ width: "24px", height: "24px" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#10b981" }}>
                      Optimal Bundle Solution Found
                    </span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginTop: "0.1rem" }}>
                      {quote.summary}
                    </h3>
                  </div>
                </div>

                <div style={{ backgroundColor: "#07090e", borderRadius: "10px", border: "1px solid #1e2638", overflow: "hidden" }}>
                  <table className="bundle-table">
                    <thead>
                      <tr>
                        <th>Bundle Size</th>
                        <th>Quantity</th>
                        <th>Total Seats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.breakdown.map((b) => (
                        <tr key={b.size}>
                          <td>{b.size} Seat Bundle</td>
                          <td style={{ fontWeight: 700, color: "#d4af37" }}>{b.count}x</td>
                          <td style={{ fontWeight: 600 }}>{b.size * b.count} seats</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: "rgba(230, 36, 41, 0.08)", fontWeight: 700 }}>
                        <td style={{ color: "#ffffff" }}>Total Allocation</td>
                        <td style={{ color: "#d4af37" }}>{quote.totalBundles} bundles</td>
                        <td style={{ color: "#10b981" }}>{groupSize} / {groupSize} seats</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px", padding: "0.8rem", fontSize: "0.825rem", color: "#34d399" }}>
                  Zero seats left empty. Exact group size of {groupSize} successfully fulfilled.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.75rem", padding: "1.5rem" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle style={{ width: "28px", height: "28px" }} />
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#ffffff" }}>No Exact Combination Available</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", maxWidth: "340px", lineHeight: 1.5 }}>
                  The cinema's available bundle sizes cannot match the requested group size of {groupSize} exactly without leaving empty seats.
                </p>
              </div>
            )
          ) : (
            <div style={{ textAlign: "center", color: "#64748b" }}>Select a cinema venue to calculate quotes.</div>
          )}
        </div>
      </div>

      {isAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e2638" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>Add Cinema Venue</h3>
              <button onClick={() => setIsAddOpen(false)} style={{ background: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleCreateCinema} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  Cinema Name
                </label>
                <input
                  type="text"
                  required
                  value={newCinemaName}
                  onChange={(e) => setNewCinemaName(e.target.value)}
                  placeholder="e.g. Star Cineplex"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  Bundle Sizes (Comma Separated, 1–500 seats)
                </label>
                <input
                  type="text"
                  required
                  value={newBundleSizes}
                  onChange={(e) => setNewBundleSizes(e.target.value)}
                  placeholder="e.g. 2, 5 or 6, 9, 20"
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-crimson">
                  Create Cinema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};