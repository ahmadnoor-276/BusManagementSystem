"use client";

import { useEffect, useState } from "react";
import type { Driver } from "@/lib/types";
import { Alert, EmptyState, PageHeader, Spinner } from "@/components/ui";

const GENDERS = ["Male", "Female", "Other"];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  async function loadDrivers() {
    setLoading(true);
    try {
      const res = await fetch("/api/drivers");
      setDrivers(await res.json());
    } catch {
      setError("Could not load drivers. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, age, contact, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(`Driver "${data.name}" added.`);
      setName("");
      setGender("");
      setAge("");
      setContact("");
      setAddress("");
      await loadDrivers();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(driver: Driver) {
    setError("");
    setSuccess("");
    if (driver._count && driver._count.buses > 0) {
      const ok = window.confirm(
        `${driver.name} is assigned to ${driver._count.buses} bus(es). Deleting will unassign them from those buses. Continue?`
      );
      if (!ok) return;
    }
    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete driver.");
        return;
      }
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    } catch {
      setError("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle="Add driver information. Drivers can then be assigned to buses."
      />

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed Ali"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="">Select gender...</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Age
            </label>
            <input
              type="number"
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 35"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Contact
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. 0300-1234567"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Model Town, Lahore"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add driver"}
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <Alert message={error} />
          <Alert message={success} variant="success" />
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : drivers.length === 0 ? (
        <EmptyState
          title="No drivers yet"
          description="Add your first driver using the form above."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {driver.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{driver.gender}</td>
                  <td className="px-4 py-3 text-slate-600">{driver.age}</td>
                  <td className="px-4 py-3 text-slate-600">{driver.contact}</td>
                  <td className="px-4 py-3 text-slate-600">{driver.address}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(driver)}
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
