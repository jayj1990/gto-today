'use client';

import { useState } from 'react';

const PRESETS = {
  'A-high dry (BB vs CO SRP)': {
    board: 'As,Kh,7d',
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,KQs,T9s,98s,AKo,AQo',
    ip: 'AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,KQs,T9s,AKo,AQo',
  },
  'Wet Q-high (BB vs BTN SRP)': {
    board: 'Qs,9h,8d',
    oop: 'QQ,JJ,TT,99,88,AKs,AQs,JTs,T9s,98s,87s,65s',
    ip: 'QQ,JJ,TT,99,88,AKs,AQs,JTs,T9s',
  },
  'Paired 772 rainbow': {
    board: '7s,7h,2d',
    oop: 'AA,KK,QQ,77,66,55,44,33,22,AKs,AQs',
    ip: 'AA,KK,QQ,77,AKs,AQs',
  },
};

type ProbeResponse = {
  actions?: string[];
  mix?: Record<string, number[]>;
  exploitability?: number;
  iterations?: number;
  elapsedMs?: number;
  note?: string;
  error?: string;
};

export default function DevSolverPage() {
  const [board, setBoard] = useState('As,Kh,7d');
  const [oop, setOop] = useState(PRESETS['A-high dry (BB vs CO SRP)']!.oop);
  const [ip, setIp] = useState(PRESETS['A-high dry (BB vs CO SRP)']!.ip);
  const [pot, setPot] = useState(5.5);
  const [eff, setEff] = useState(97.5);
  const [maxIter, setMaxIter] = useState(150);
  const [accuracy, setAccuracy] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ProbeResponse | null>(null);

  const handleSolve = async () => {
    setLoading(true);
    setResult(null);
    setElapsed(0);
    const start = Date.now();
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
    try {
      const r = await fetch('/api/live-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: board.split(',').map((s) => s.trim()),
          oopRange: oop,
          ipRange: ip,
          pot,
          effStack: eff,
          scenario: 'cash',
          accuracy,
          maxIter,
        }),
      });
      setResult(await r.json());
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      clearInterval(tick);
      setLoading(false);
    }
  };

  const applyPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setBoard(p.board);
    setOop(p.oop);
    setIp(p.ip);
    setResult(null);
  };

  const mixEntries = result?.mix ? Object.entries(result.mix).slice(0, 40) : [];
  const isCache = (result?.note ?? '').startsWith('cache hit');
  const isMock = (result?.note ?? '').startsWith('Mock');

  return (
    <main className="mx-auto max-w-4xl safe-pad-x py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          /dev/solver
        </p>
        <h1 className="mt-2 font-display text-[32px] font-bold tracking-[-0.02em]">
          Live solver debug
        </h1>
        <p className="mt-2 text-body text-fg-muted">
          POST /api/live-solve 를 직접 호출. 캐시 히트 여부·솔브 시간·응답 크기 확인용.
        </p>
      </header>

      <section className="mb-6 flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => applyPreset(k as keyof typeof PRESETS)}
            className="rounded-[var(--radius-button)] border-hair surface px-3 py-1.5 font-mono text-[11px] text-fg-muted hover:text-fg"
          >
            {k}
          </button>
        ))}
      </section>

      <section className="grid gap-3 rounded-[var(--radius-panel)] border-hair p-4">
        <LabeledInput label="Board (comma)" value={board} onChange={setBoard} />
        <LabeledTextarea label="OOP range" value={oop} onChange={setOop} rows={2} />
        <LabeledTextarea label="IP range" value={ip} onChange={setIp} rows={2} />
        <div className="grid grid-cols-4 gap-2">
          <LabeledNumber label="Pot BB" value={pot} onChange={setPot} />
          <LabeledNumber label="Eff BB" value={eff} onChange={setEff} />
          <LabeledNumber label="Accuracy %" value={accuracy} onChange={setAccuracy} step={0.1} />
          <LabeledNumber label="Max iter" value={maxIter} onChange={setMaxIter} step={10} />
        </div>
        <button
          type="button"
          onClick={handleSolve}
          disabled={loading}
          className="h-11 rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] disabled:opacity-50"
        >
          {loading ? `솔빙 중… ${elapsed}s` : 'Solve'}
        </button>
      </section>

      {result && (
        <section className="mt-6 rounded-[var(--radius-panel)] border-hair p-4">
          {result.error ? (
            <p className="text-[color:var(--color-raise)]">에러: {result.error}</p>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2 font-mono text-[12px] md:grid-cols-4">
                <Stat label="Exploitability" value={`${result.exploitability?.toFixed(3)}%`} />
                <Stat label="Iterations" value={String(result.iterations)} />
                <Stat label="Elapsed" value={`${((result.elapsedMs ?? 0) / 1000).toFixed(1)}s`} />
                <Stat
                  label="Source"
                  value={isCache ? '캐시' : isMock ? 'Mock' : '실솔브'}
                  tone={isCache ? 'good' : isMock ? 'warn' : 'accent'}
                />
              </div>
              {result.note && (
                <p className="mb-3 font-mono text-[11px] text-fg-muted">note: {result.note}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[11px]">
                  <thead className="text-fg-muted">
                    <tr>
                      <th className="px-2 py-1 text-left">Combo</th>
                      {result.actions?.map((a) => (
                        <th key={a} className="px-2 py-1 text-right">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mixEntries.map(([combo, freqs]) => (
                      <tr key={combo} className="border-t-hair">
                        <td className="px-2 py-1 font-semibold">{combo}</td>
                        {freqs.map((f, i) => (
                          <td key={i} className="px-2 py-1 text-right tabular-nums">
                            {f.toFixed(3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(result.mix ?? {}).length > 40 && (
                  <p className="mt-2 text-[11px] text-fg-muted">
                    (첫 40개만 표시 · 총 {Object.keys(result.mix ?? {}).length}개)
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-[var(--radius-button)] border-hair surface px-3 py-2 font-mono text-[12px]"
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 block w-full rounded-[var(--radius-button)] border-hair surface px-3 py-2 font-mono text-[11px]"
      />
    </label>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
        {label}
      </span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block w-full rounded-[var(--radius-button)] border-hair surface px-2 py-2 font-mono text-[12px] tabular-nums"
      />
    </label>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'warn' | 'accent';
}) {
  const color =
    tone === 'good'
      ? 'text-[color:var(--color-call)]'
      : tone === 'warn'
        ? 'text-[color:var(--color-warning)]'
        : tone === 'accent'
          ? 'text-[color:var(--color-accent)]'
          : 'text-fg';
  return (
    <div className="rounded-[var(--radius-button)] border-hair surface p-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-fg-muted">{label}</p>
      <p className={`mt-0.5 text-[15px] font-semibold ${color}`}>{value}</p>
    </div>
  );
}
