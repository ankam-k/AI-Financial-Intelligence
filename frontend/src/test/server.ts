/**
 * A stubbed `fetch` that routes by path, so tests exercise the real API client
 * — its query building, its error envelope handling, its network-failure path
 * — rather than a mock of it.
 */

import { vi } from 'vitest';
import * as fixtures from './fixtures';

export interface RouteOverrides {
  profile?: unknown;
  insights?: unknown;
  narrations?: unknown;
  status?: number;
  errorBody?: { detail: string; error: string };
  /** Reject at the network level, as an unreachable backend would. */
  networkError?: boolean;
  /** Resolve after this many ms, to observe the loading state. */
  delayMs?: number;
}

export interface StubbedServer {
  /** Every URL requested, in order. */
  calls: string[];
}

export function stubServer(overrides: RouteOverrides = {}): StubbedServer {
  const calls: string[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push(url);

    if (overrides.networkError) throw new TypeError('Failed to fetch');
    if (overrides.delayMs) await new Promise((resolve) => setTimeout(resolve, overrides.delayMs));

    if (overrides.status && overrides.status >= 400) {
      return new Response(
        JSON.stringify(overrides.errorBody ?? { detail: 'Boom', error: 'ValidationError' }),
        { status: overrides.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = url.includes('/api/chat/capabilities')
      ? fixtures.chatCapabilities
      : url.includes('/api/chat')
        ? fixtures.chatAnswer
        : url.includes('/api/profile')
          ? (overrides.profile ?? fixtures.profile)
          : url.includes('/api/narrations')
            ? (overrides.narrations ?? fixtures.narratedAnalysis)
            : (overrides.insights ?? fixtures.analysis);

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { calls };
}

export interface ChatOverrides {
  answer?: unknown;
  capabilitiesFail?: boolean;
  networkError?: boolean;
  delayMs?: number;
}

export interface StubbedChat {
  /** Every question actually sent, in order. */
  questions: string[];
  /** Every request body, so a test can assert what was NOT sent. */
  bodies: Record<string, unknown>[];
  /** Stop failing, for retry tests. */
  recover: () => void;
}

export function stubChat(overrides: ChatOverrides = {}): StubbedChat {
  const questions: string[] = [];
  const bodies: Record<string, unknown>[] = [];
  let failing = overrides.networkError ?? false;

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('/api/chat/capabilities')) {
      if (overrides.capabilitiesFail) throw new TypeError('Failed to fetch');
      return new Response(JSON.stringify(fixtures.chatCapabilities), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    bodies.push(body);
    questions.push(String(body.question ?? ''));

    if (failing) throw new TypeError('Failed to fetch');
    if (overrides.delayMs) await new Promise((resolve) => setTimeout(resolve, overrides.delayMs));

    const answer = overrides.answer ?? fixtures.chatAnswer;
    return new Response(JSON.stringify({ ...(answer as object), question: body.question }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  vi.stubGlobal('fetch', fetchMock);
  return {
    questions,
    bodies,
    recover: () => {
      failing = false;
    },
  };
}
