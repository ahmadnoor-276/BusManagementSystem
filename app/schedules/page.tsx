"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  DeleteButton,
  EditButton,
  EmptyState,
  PageHeader,
  Spinner,
} from '@/components/ui';
import type {
  Bus,
  Route,
  Schedule,
} from '@/lib/types';

function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${suffix}`;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filterRouteId, setFilterRouteId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formRouteId, setFormRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  function resetForm() {
    setEditingId(null);
    setBusId("");
    setDepartureTime("");
  }

  function startEdit(schedule: Schedule) {
    setError("");
    setSuccess("");
    setEditingId(schedule.id);
    setFormRouteId(schedule.bus.route.id);
    setBusId(schedule.bus.id);
    setDepartureTime(schedule.departureTime);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loadSchedules = useCallback(async (routeId: string) => {
    const url = routeId
      ? `/api/schedules?routeId=${encodeURIComponent(routeId)}`
      : "/api/schedules";
    const res = await fetch(url);
    setSchedules(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [busRes, routeRes] = await Promise.all([
          fetch("/api/buses"),
          fetch("/api/routes"),
        ]);
        setBuses(await busRes.json());
        setRoutes(await routeRes.json());
        await loadSchedules("");
      } catch {
        setError("Could not load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadSchedules]);

  const busesForForm = useMemo(
    () => (formRouteId ? buses.filter((b) => b.route.id === formRouteId) : buses),
    [buses, formRouteId]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch(
        editingId ? `/api/schedules/${editingId}` : "/api/schedules",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ busId, departureTime }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(
        `${editingId ? "Updated" : "Scheduled"} bus "${data.bus.busNumber}" at ${formatTime(data.departureTime)}.`
      );
      resetForm();
      await loadSchedules(filterRouteId);
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
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete schedule.");
        return;
      }
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleFilterChange(routeId: string) {
    setFilterRouteId(routeId);
    setLoading(true);
    try {
      await loadSchedules(routeId);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      <PageHeader
        title="Schedules"
        subtitle="Set departure times for buses and view them in order."
      />

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Route
            </label>
            <select
              value={formRouteId}
              onChange={(e) => {
                setFormRouteId(e.target.value);
                setBusId("");
              }}
              className={inputClass}
            >
              <option value="">All routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fromCity} → {r.toCity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Bus
            </label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a bus...</option>
              {busesForForm.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} ({b.route.fromCity} → {b.route.toCity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Departure time
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
                ? "Update schedule"
                : "Add schedule"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <Alert message={error} />
          <Alert message={success} variant="success" />
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Departures (earliest first)
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Route</label>
          <select
            value={filterRouteId}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fromCity} → {r.toCity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No schedules yet"
          description="Add a departure time using the form above."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Bus number</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-brand-700">
                    {formatTime(s.departureTime)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {s.bus.busNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.bus.driver?.name ?? "TBA"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {s.bus.route.fromCity} → {s.bus.route.toCity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EditButton onClick={() => startEdit(s)} />
                    <DeleteButton
                      onConfirm={() => handleDelete(s.id)}
                      confirmMessage={`Delete ${formatTime(s.departureTime)} departure?`}
                    />
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
