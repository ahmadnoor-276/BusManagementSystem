"use client";

import {
  useEffect,
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
import type { Route } from '@/lib/types';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  function resetForm() {
    setEditingId(null);
    setFromCity("");
    setToCity("");
  }

  function startEdit(route: Route) {
    setError("");
    setSuccess("");
    setEditingId(route.id);
    setFromCity(route.fromCity);
    setToCity(route.toCity);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadRoutes() {
    setLoading(true);
    try {
      const res = await fetch("/api/routes");
      setRoutes(await res.json());
    } catch {
      setError("Could not load routes. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoutes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch(
        editingId ? `/api/routes/${editingId}` : "/api/routes",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromCity, toCity }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(
        `Route "${data.fromCity} → ${data.toCity}" ${editingId ? "updated" : "added"}.`
      );
      resetForm();
      await loadRoutes();
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
      const res = await fetch(`/api/routes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete route.");
        return;
      }
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      <PageHeader
        title="Routes"
        subtitle="Define the city-to-city routes your buses run."
      />

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
                ? "Update route"
                : "Add route"}
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

      {loading ? (
        <Spinner />
      ) : routes.length === 0 ? (
        <EmptyState
          title="No routes yet"
          description="Add your first route, e.g. Nankana → Lahore."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <span>{route.fromCity}</span>
                  <span className="text-gold-600">→</span>
                  <span>{route.toCity}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {route._count?.buses ?? 0} bus
                  {(route._count?.buses ?? 0) === 1 ? "" : "es"} assigned
                </p>
              </div>
              <div className="flex items-center">
                <EditButton onClick={() => startEdit(route)} />
                <DeleteButton
                  onConfirm={() => handleDelete(route.id)}
                  confirmMessage={
                    route._count && route._count.buses > 0
                      ? `Delete? ${route._count.buses} bus(es) will also be removed.`
                      : "Delete route?"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
