"use client";

import React from "react";
import { SportCoachUiDefinition, SportTelemetryFieldSchema } from "@/lib/domain/coach/schema/sportCoachUiSchema";
import { Activity, AlertTriangle, CheckCircle2, Sliders, ShieldAlert } from "lucide-react";

interface DynamicTelemetryFormProps {
  definition: SportCoachUiDefinition;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function DynamicTelemetryForm({
  definition,
  values,
  onChange,
}: DynamicTelemetryFormProps) {
  const summaries = definition.calculateSummary ? definition.calculateSummary(values) : [];

  const renderField = (field: SportTelemetryFieldSchema) => {
    const val = values[field.key] !== undefined ? values[field.key] : (field.defaultValue ?? "");

    if (field.type === "boolean") {
      const isChecked = Boolean(val);
      const isSafety = field.category === "safety";

      return (
        <div
          key={field.key}
          className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
            isChecked && isSafety
              ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/40 text-[var(--color-alert-red)]"
              : isChecked
              ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30 text-[var(--color-text-primary)]"
              : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
        >
          <div className="flex items-center gap-2">
            {isSafety ? (
              <ShieldAlert className={`w-4 h-4 ${isChecked ? "text-[var(--color-alert-red)]" : "text-[var(--color-text-muted)]"}`} />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${isChecked ? "text-[var(--color-cycling)]" : "text-[var(--color-text-muted)]"}`} />
            )}
            <div>
              <span className="text-xs font-semibold block">{field.label}</span>
              {field.tooltip && <span className="text-[10px] text-[var(--color-text-muted)] block">{field.tooltip}</span>}
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(field.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-cycling)]"></div>
          </label>
        </div>
      );
    }

    if (field.type === "slider") {
      const numVal = Number(val) || field.min || 1;
      return (
        <div key={field.key} className="space-y-1.5 p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {field.label}
            </label>
            <span className="text-xs font-bold text-[var(--color-cycling)] font-tabular">
              {numVal} {field.unit || ""}
            </span>
          </div>
          <input
            type="range"
            min={field.min ?? 1}
            max={field.max ?? 10}
            step={field.step ?? 1}
            value={numVal}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-cycling)]"
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className="space-y-1">
          <label className="block text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
            {field.label}
          </label>
          <select
            value={val}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:border-[var(--color-cycling)] focus:outline-hidden transition-colors"
          >
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Default numeric input
    return (
      <div key={field.key} className="space-y-1">
        <label className="block text-[10px] uppercase font-semibold text-[var(--color-text-secondary)] truncate">
          {field.label}
        </label>
        <div className="relative">
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={val}
            placeholder={field.placeholder || "0"}
            onChange={(e) => onChange(field.key, e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular focus:border-[var(--color-cycling)] focus:outline-hidden transition-colors"
          />
          {field.unit && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-muted)] pointer-events-none">
              {field.unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Live Computed Metric Badges */}
      {summaries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[var(--color-cycling)]" /> Metrik Instan:
          </span>
          {summaries.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
            >
              <span className="text-[var(--color-text-secondary)]">{s.label}:</span>
              <span className="text-[var(--color-cycling)] font-tabular">{s.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Dynamic Grid of Generated Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {definition.fields.map(renderField)}
      </div>
    </div>
  );
}
