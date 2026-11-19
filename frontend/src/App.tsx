import { useState } from "react";
import { MoviesView } from "./views/MoviesView";
import { RewatchPlanView } from "./views/RewatchPlanView";
import { BookingView } from "./views/BookingView";
import { Film, ListOrdered, Ticket } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "rewatch" | "booking">("movies");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="font-extrabold tracking-tight text-white flex items-center gap-2">
                DOOMSDAY READY <span className="text-xs font-semibold bg-red-600 text-white px-2 py-0.5 rounded">MCU 2027</span>
              </h1>
            </div>
          </div>

          <nav className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("movies")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === "movies" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" /> Movies
            </button>
            <button
              onClick={() => setActiveTab("rewatch")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === "rewatch" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <ListOrdered className="w-4 h-4" /> Rewatch Plan
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === "booking" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Ticket className="w-4 h-4" /> Booking
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === "movies" && <MoviesView />}
        {activeTab === "rewatch" && <RewatchPlanView />}
        {activeTab === "booking" && <BookingView />}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        Doomsday Ready • Built for Avengers: Doomsday Rewatch Planning
      </footer>
    </div>
  );
}

export default App;