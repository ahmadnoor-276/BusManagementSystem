"use client";

import { useEffect, useState } from "react";
import type { Bus, Route } from "@/lib/types";
import { Alert, EmptyState, PageHeader, Spinner } from "@/components/ui";

const NEW_ROUTE = "__new__";

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [busNumber, setBusNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [routeId, setRouteId] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [busRes, routeRes] = await Promise.all([
        fetch("/api/buses"),
        fetch("/api/routes"),
      ]);
      setBuses(await busRes.json());
      setRoutes(await routeRes.json());
    } catch {
      setError("Could not load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      busNumber,
      driverName,
    };
    if (routeId === NEW_ROUTE) {
      payload.newRoute = { fromCity, toCity };
    } else {
      payload.routeId = routeId;
    }

    try {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(`Bus "${data.busNumber}" added.`);
      setBusNumber("");
      setDriverName("");
      setRouteId("");
      setFromCity("");
      setToCity("");
      await loadData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/buses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete bus.");
        return;
      }
      setBuses((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      <PageHeader
        title="Buses"
        subtitle="Register buses with their driver and route."
      />

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Bus number
            </label>
            <input
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="e.g. LES-4821"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Driver name
            </label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Ahmed Ali"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Route
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a route...</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fromCity} → {r.toCity}
                </option>
              ))}
              <option value={NEW_ROUTE}>+ Add a new route</option>
            </select>
          </div>

          {routeId === NEW_ROUTE && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  From city
                </label>
                <input
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="e.g. Nankana"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  To city
                </label>
                <input
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="e.g. Lahore"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add bus"}
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <Alert message={error} />
          <Alert message={success} variant="success" />
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : buses.length === 0 ? (
        <EmptyState
          title="No buses yet"
          description="Add your first bus using the form above."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Bus number</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {bus.busNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{bus.driverName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {bus.route.fromCity} → {bus.route.toCity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(bus.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
