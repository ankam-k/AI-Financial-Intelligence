/**
 * Shell and navigation.
 *
 * Two views, so a router would be one dependency for one piece of state.
 * The window and narration-source controls live here because both views scope
 * to them — a chat answer and a dashboard card must describe the same window,
 * or the page contradicts itself.
 */

import { useState } from 'react';
import { Chat } from './pages/Chat';
import { Dashboard } from './pages/Dashboard';
import { useTheme, type ThemeChoice } from './hooks/useTheme';

type View = 'dashboard' | 'chat';

const WINDOWS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
];

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [days, setDays] = useState(90);
  const [generate, setGenerate] = useState(false);
  const [theme, setTheme] = useTheme();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="shell">
        <header className="topbar">
          <nav className="control-group" aria-label="Sections">
            <button
              type="button"
              aria-pressed={view === 'dashboard'}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button type="button" aria-pressed={view === 'chat'} onClick={() => setView('chat')}>
              Ask
            </button>
          </nav>
        </header>

        <div className="controls">
          <div className="control-group" role="group" aria-label="Analysis window">
            {WINDOWS.map((option) => (
              <button
                key={option.days}
                type="button"
                aria-pressed={days === option.days}
                onClick={() => setDays(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="control-group" role="group" aria-label="Narration source">
            <button type="button" aria-pressed={!generate} onClick={() => setGenerate(false)}>
              Template
            </button>
            <button
              type="button"
              aria-pressed={generate}
              onClick={() => setGenerate(true)}
              title="Ask the local model to write these. Slower — roughly 18s per insight."
            >
              AI-written
            </button>
          </div>

          <span className="control-spacer" />

          <div className="control-group" role="group" aria-label="Colour theme">
            {THEMES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={theme === option.value}
                onClick={() => setTheme(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <main id="main">
          {view === 'dashboard' ? (
            <Dashboard days={days} generate={generate} />
          ) : (
            <Chat days={days} generate={generate} />
          )}
        </main>
      </div>
    </>
  );
}
