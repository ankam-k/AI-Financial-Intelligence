/**
 * Reading values out of an insight's `metrics` bag.
 *
 * The engine guarantees these are JSON primitives but not their TypeScript
 * types, so every read is narrowed here rather than cast at the call site. A
 * missing or wrong-typed key returns the fallback instead of throwing: a
 * dashboard that blanks out because one metric changed shape is worse than one
 * that shows a dash.
 *
 * **Nothing here computes.** These are lookups and type guards.
 */

import type { Insight, InsightType, Metrics, MetricValue } from '../api/types';

export function num(metrics: Metrics, key: string, fallback = 0): number {
  const value = metrics[key];
  return typeof value === 'number' ? value : fallback;
}

export function maybeNum(metrics: Metrics, key: string): number | null {
  const value = metrics[key];
  return typeof value === 'number' ? value : null;
}

export function str(metrics: Metrics, key: string, fallback = ''): string {
  const value = metrics[key];
  return typeof value === 'string' ? value : fallback;
}

export function bool(metrics: Metrics, key: string, fallback = false): boolean {
  const value = metrics[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function rows(metrics: Metrics, key: string): Metrics[] {
  const value = metrics[key];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Metrics => typeof item === 'object' && item !== null && !Array.isArray(item),
  );
}

export function nested(metrics: Metrics, key: string): Metrics {
  const value: MetricValue | undefined = metrics[key];
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value;
  return {};
}

/** The first insight of a type, or `null`. Insights are unique per type here. */
export function pick(insights: Insight[], type: InsightType): Insight | null {
  return insights.find((insight) => insight.type === type) ?? null;
}

/** Every insight of a type, in engine order. */
export function pickAll(insights: Insight[], type: InsightType): Insight[] {
  return insights.filter((insight) => insight.type === type);
}
