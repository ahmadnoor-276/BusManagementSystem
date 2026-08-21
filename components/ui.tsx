"use client";

import { useState } from "react";

export function DeleteButton({
  onConfirm,
  confirmMessage = "Delete?",
}: {
  onConfirm: () => void | Promise<void>;
  confirmMessage?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center justify-end gap-2">
        <span className="text-xs text-slate-500">{confirmMessage}</span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
              setConfirming(false);
            }
          }}
          className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirming(false)}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
    >
      Delete
    </button>
  );
}

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Edit"
      title="Edit"
      className="mr-1 inline-grid h-7 w-7 place-items-center rounded-md text-brand-600 transition hover:bg-brand-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function Alert({
  message,
  variant = "error",
}: {
  message: string;
  variant?: "error" | "success";
}) {
  if (!message) return null;
  const styles =
    variant === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
