/**
 * Response shapes, mirroring the backend schemas.
 *
 * `metrics` is deliberately typed as an index signature rather than a union of
 * fifteen exact shapes. The engine owns those shapes; restating them here
 * would create a second definition to keep in sync, and a mismatch would be a
 * TypeScript error rather than the missing-data case it actually is. Reading
 * is narrowed at the point of use instead (see `lib/metrics.ts`).
 */

export type MetricValue =
  | string
  | number
  | boolean
  | null
  | MetricValue[]
  | { [key: string]: MetricValue };

export type Metrics = Record<string, MetricValue>;

export interface Window {
  start: string;
  end: string;
  days: number;
}

export interface Evidence {
  kind: 'EXPENSE' | 'CHECK_IN' | 'LIFE_EVENT' | 'AGGREGATE';
  label: string;
  ref_id: string | null;
  payload: Metrics;
}

export type InsightTier = 'T1' | 'T2' | 'T3';

export type InsightType =
  | 'SPENDING_TOTAL'
  | 'SPENDING_BY_CATEGORY'
  | 'SPENDING_MONTHLY_COMPARISON'
  | 'SPENDING_WEEKLY_COMPARISON'
  | 'SPENDING_DAILY_TREND'
  | 'BUDGET_UTILIZATION'
  | 'HABIT_COMPLETION'
  | 'HABIT_STREAK'
  | 'HABIT_SLEEP_AVERAGE'
  | 'HABIT_EXERCISE_FREQUENCY'
  | 'HABIT_MISSED_DAYS'
  | 'EVENT_SUMMARY'
  | 'EVENT_IMPACT'
  | 'BEHAVIOR_RELATIONSHIP'
  | 'DATA_SUFFICIENCY';

export interface Insight {
  id: string;
  type: InsightType;
  tier: InsightTier;
  title_key: string;
  subject: string | null;
  window: Window;
  metrics: Metrics;
  evidence: Evidence[];
  confidence: number | null;
  created_at: string;
}

export interface AnalysisRun {
  engine_version: string;
  generated_at: string;
  window: Window;
  gates: Record<string, number>;
  hypotheses_tested: number;
  relationships_emitted: number;
  relationships_suppressed: number;
  insight_count: number;
  notice_count: number;
  inputs: { expenses: number; check_ins: number; events: number };
  currency: string;
}

export interface AnalysisResult {
  run: AnalysisRun;
  insights: Insight[];
  notices: Insight[];
}

export interface ValidationFailure {
  validator: string;
  detail: string;
}

export interface Narration {
  insight_id: string;
  insight_type: InsightType;
  tier: InsightTier;
  observation: string;
  evidence: string;
  interpretation: string;
  confidence: string;
  confidence_value: number | null;
  suggestion: string | null;
  source: 'LLM' | 'TEMPLATE';
  model: string | null;
  validation_failures: ValidationFailure[];
  fallback_reason: string | null;
}

export interface NarrationStats {
  total: number;
  generated: number;
  templated: number;
  generation_attempted: number;
  rejected_by_validation: number;
  provider: string;
  model: string;
}

export interface NarratedAnalysis {
  run: AnalysisRun;
  narration: NarrationStats;
  narrations: Narration[];
}

export interface Profile {
  id: string;
  display_name: string;
  timezone: string;
  currency: string;
  monthly_budget_paise: number | null;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  insight_id: string;
  insight_type: InsightType;
  tier: InsightTier;
}

export type AnswerStatus = 'ANSWERED' | 'REFUSED';

export type RefusalReason =
  | 'PROHIBITED_TOPIC'
  | 'NOT_ANSWERABLE_FROM_ANALYSIS'
  | 'INSUFFICIENT_DATA'
  | 'UNCLEAR';

export interface ChatResponse {
  question: string;
  status: AnswerStatus;
  answer: string;
  intent: string | null;
  refusal_reason: RefusalReason | null;
  source: 'LLM' | 'TEMPLATE';
  model: string | null;
  citations: Citation[];
  validation_failures: ValidationFailure[];
  fallback_reason: string | null;
  context_summary: Record<string, unknown>;
  window: Window;
}

export interface ChatCapabilities {
  examples: string[];
  intents: string[];
  max_question_chars: number;
  single_turn: boolean;
  note: string;
}

export interface DemoStatus {
  enabled: boolean;
  profile: string | null;
  expenses: number;
  check_ins: number;
  events: number;
  monthly_budget_paise: number | null;
  earliest: string | null;
  latest: string | null;
  is_empty: boolean;
}

export interface LLMStatus {
  provider: string;
  model: string;
  available: boolean;
  detail: string;
  narration_mode: 'GENERATED' | 'TEMPLATE';
}
