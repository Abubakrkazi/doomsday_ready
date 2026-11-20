import { useState } from "react";
import { OverviewView } from "./views/OverviewView";
import { MoviesView } from "./views/MoviesView";
import { RewatchPlanView } from "./views/RewatchPlanView";
import { BookingView } from "./views/BookingView";
import { LayoutDashboard, Film, ListOrdered, Ticket, Menu, X, Shield } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "movies" | "rewatch" | "booking">("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getPageInfo = () => {
    switch (activeTab) {
      case "overview":
        return { title: "Mission Control Overview", desc: "Live analytics and MCU catch-up overview" };
      case "movies":
        return { title: "MCU Movie Catalog", desc: "Manage movies, prerequisite dependencies, and watch status" };
      case "rewatch":
        return { title: "Topological Rewatch Plan", desc: "Topologically ordered preparation sequence for target MCU premiere" };
      case "booking":
        return { title: "Watch-Party Bundle Quote", desc: "Optimal seat bundle combination with zero empty seats" };
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "movies", label: "Movies", icon: Film },
    { id: "rewatch", label: "Rewatch Plan", icon: ListOrdered },
    { id: "booking", label: "Cinema Booking", icon: Ticket },
  ] as const;

  const pageInfo = getPageInfo();

  return (
    <div className="app-shell">
      <aside className={`sidebar-nav ${isMobileOpen ? "is-open" : ""}`}>
        <div style={{ height: "70px", display: "flex", alignItems: "center", padding: "0 1.5rem", borderBottom: "1px solid #1e2638", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#e62429", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
            <Shield style={{ width: "20px", height: "20px" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
              DOOMSDAY READY
            </h1>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#d4af37", textTransform: "uppercase" }}>v1.0 • Phase 6 Ready</span>
          </div>
        </div>

        <nav style={{ padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? "#e62429" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  border: "none",
                }}
              >
                <Icon style={{ width: "18px", height: "18px" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid #1e2638", fontSize: "0.75rem", color: "#64748b", textAlign: "center" }}>
          Blinto Talent Accelerator 2027
        </div>
      </aside>

      <div className="main-viewport">
        <header className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{ background: "none", color: "#ffffff", border: "none", cursor: "pointer", display: "none" }}
              className="mobile-toggle"
            >
              {isMobileOpen ? <X style={{ width: "22px", height: "22px" }} /> : <Menu style={{ width: "22px", height: "22px" }} />}
            </button>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>{pageInfo.title}</h2>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{pageInfo.desc}</p>
            </div>
          </div>
        </header>

        <main className="content-container">
          {activeTab === "overview" && <OverviewView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "movies" && <MoviesView />}
          {activeTab === "rewatch" && <RewatchPlanView />}
          {activeTab === "booking" && <BookingView />}
        </main>
      </div>
    </div>
  );
}

export default App;