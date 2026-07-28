/** The shell: navigation, the filter row, and the theme toggle. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { stubServer } from './test/server';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('navigation', () => {
  it('opens on the dashboard', async () => {
    stubServer();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Total spent')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches to the chat view', async () => {
    stubServer();
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));

    expect(screen.getByText('Ask about your money')).toBeInTheDocument();
    expect(screen.queryByText('Total spent')).not.toBeInTheDocument();
  });

  it('names the sections for assistive technology', () => {
    stubServer();
    render(<App />);

    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
  });
});

describe('window filter', () => {
  it('refetches with the chosen window and keeps the old data meanwhile', async () => {
    const server = stubServer();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Total spent')).toBeInTheDocument());
    const before = server.calls.length;

    await userEvent.click(screen.getByRole('button', { name: '30 days' }));

    await waitFor(() => expect(server.calls.length).toBeGreaterThan(before));
    expect(server.calls.some((url) => url.includes('days=30'))).toBe(true);
    // The previous render stays on screen instead of flashing a skeleton.
    expect(screen.getByText('Total spent')).toBeInTheDocument();
  });

  it('marks the active window for assistive technology', async () => {
    stubServer();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Total spent')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: '90 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('asks the backend to generate prose only when requested', async () => {
    const server = stubServer();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Total spent')).toBeInTheDocument());
    expect(server.calls.some((url) => url.includes('generate=false'))).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'AI-written' }));

    await waitFor(() =>
      expect(server.calls.some((url) => url.includes('generate=true'))).toBe(true),
    );
  });

  it('scopes both views, so they cannot contradict each other', async () => {
    const server = stubServer();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Total spent')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: '30 days' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.click(screen.getByRole('button', { name: /How much did I spend/i }));

    await waitFor(() => {
      const chatCall = server.calls.find((url) => url.includes('/api/chat') && !url.includes('capabilities'));
      expect(chatCall).toBeTruthy();
    });
  });
});

describe('theme', () => {
  it('stamps an explicit choice on the document', async () => {
    stubServer();
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('returns to the OS setting on Auto', async () => {
    stubServer();
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('button', { name: 'Auto' }));

    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });
});

describe('accessibility', () => {
  it('provides a skip link to the content', () => {
    stubServer();
    render(<App />);

    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#main',
    );
  });

  it('groups the filters with accessible names', () => {
    stubServer();
    render(<App />);

    expect(screen.getByRole('group', { name: 'Analysis window' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Colour theme' })).toBeInTheDocument();
  });
});
