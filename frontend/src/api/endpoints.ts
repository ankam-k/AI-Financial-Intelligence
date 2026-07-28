/** Every backend call the dashboard makes, in one place. */

import { apiGet, apiPost } from './client';
import type {
  AnalysisResult,
  ChatCapabilities,
  ChatResponse,
  DemoStatus,
  LLMStatus,
  NarratedAnalysis,
  Profile,
} from './types';

export interface WindowParams {
  days?: number;
  start_date?: string;
  end_date?: string;
}

export const getProfile = (signal?: AbortSignal) =>
  apiGet<Profile>('/api/profile', {}, { signal });

export const getInsights = (params: WindowParams, signal?: AbortSignal) =>
  apiGet<AnalysisResult>('/api/insights', { ...params }, { signal });

/**
 * Narration for the same window.
 *
 * `generate=false` by default: a local 7B model takes roughly 18 seconds per
 * insight, so a dashboard that waited for it would look broken. Template prose
 * is served immediately and identical in substance; the user opts into
 * generation explicitly.
 */
export const getNarrations = (
  params: WindowParams & { generate?: boolean },
  signal?: AbortSignal,
) => apiGet<NarratedAnalysis>('/api/narrations', { generate: false, ...params }, { signal });

export const getLLMStatus = (signal?: AbortSignal) =>
  apiGet<LLMStatus>('/api/narrations/status', {}, { signal });

/**
 * Ask one question.
 *
 * Note the absence of a conversation id and of any history parameter. Each
 * question is answered independently from the analysis window; the transcript
 * on screen is a display artefact the server never sees (SRS-7.7).
 */
export const askChat = (
  body: { question: string; days?: number; generate?: boolean },
  signal?: AbortSignal,
) => apiPost<ChatResponse>('/api/chat', body, { signal });

export const getChatCapabilities = (signal?: AbortSignal) =>
  apiGet<ChatCapabilities>('/api/chat/capabilities', {}, { signal });

export const getDemoStatus = (signal?: AbortSignal) =>
  apiGet<DemoStatus>('/api/demo/status', {}, { signal });

/** Destructive: replaces whatever is loaded with the demo dataset. */
export const seedDemo = (signal?: AbortSignal) =>
  apiPost<DemoStatus>('/api/demo/seed', {}, { signal });
