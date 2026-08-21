"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route, Schedule } from "@/lib/types";
import { EmptyState, Spinner } from "@/components/ui";

function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${suffix}`;
}

export default function HomePage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/routes");
        setRoutes(await res.json());
      } catch {
        setError("Could not load routes. Please refresh.");
      } finally {
        setLoadingRoutes(false);
      }
    })();
  }, []);

  async function handleRouteChange(routeId: string) {
    setSelectedRouteId(routeId);
    setError("");
    if (!routeId) {
      setSchedules([]);
      return;
    }
    setLoadingSchedules(true);
    try {
      const res = await fetch(
        `/api/schedules?routeId=${encodeURIComponent(routeId)}`
      );
      setSchedules(await res.json());
    } catch {
      setError("Could not load schedules. Please try again.");
    } finally {
      setLoadingSchedules(false);
    }
  }

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId),
    [routes, selectedRouteId]
  );

  return (
    <div>
      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-2xl bg-brand-700 px-6 py-10 text-center text-white sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bus Schedules
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-200">
          Choose your route to see all scheduled bus departures, earliest first.
        </p>

        <div className="mx-auto mt-6 max-w-md text-left">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gold-400">
            Select a route
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => handleRouteChange(e.target.value)}
            disabled={loadingRoutes}
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60"
          >
            <option value="">
              {loadingRoutes ? "Loading routes..." : "-- Choose a route --"}
            </option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fromCity} → {r.toCity}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!selectedRouteId ? (
        <EmptyState
          title="No route selected"
          description="Pick a route from the dropdown above to view its scheduled buses."
        />
      ) : loadingSchedules ? (
        <Spinner label="Loading schedules..." />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No buses scheduled"
          description={
            selectedRoute
              ? `There are no departures scheduled for ${selectedRoute.fromCity} → ${selectedRoute.toCity} yet.`
              : "There are no departures scheduled for this route yet."
          }
        />
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedRoute?.fromCity}{" "}
              <span className="text-gold-600">→</span>{" "}
              {selectedRoute?.toCity}
            </h2>
            <span className="text-sm text-slate-400">
              {schedules.length} departure
              {schedules.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-brand-50 text-center">
                  <span className="text-lg font-bold leading-none text-brand-700">
                    {formatTime(s.departureTime)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {s.bus.busNumber}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    Driver: {s.bus.driver?.name ?? "TBA"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
