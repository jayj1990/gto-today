'use client';

// 교정지 화면(공개) — 워드의 "변경 내용 추적"과 같은 조작감.
//   수정한 자리를 누르면 원문/수정안이 뜨고 적용·취소·직접입력 중 하나를 고른다.
//   고른 결과는 800ms 디바운스로 서버(KvStore)에 자동 저장돼, 같은 링크를 연 사람 모두가 같은 상태를 본다.
//   저장이 실패해도 화면 조작은 계속 되게 두고 상태 문구로만 알린다(회신을 못 받는 것보다 낫다).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Block, Cat, ProofDoc, Section, Seg } from './doc';

const CATN: Record<Cat, string> = { req: '필수 수정', opt: '선택 수정', chk: '확인 필요' };

type Dec = Record<string, string>; // "a" | "r" | "c:<직접 입력한 문구>"
type Change = { id: string; c: Cat };
type PopTarget = { id: string; c: Cat; d: string; i: string; block?: boolean };

const isCustom = (v: string | undefined) => typeof v === 'string' && v.slice(0, 2) === 'c:';
const hasId = (s: Seg): s is Extract<Seg, { id: string }> => 'id' in s;

export function ProofApp({ token, doc, initial }: { token: string; doc: ProofDoc; initial: Dec }) {
  const [dec, setDec] = useState<Dec>(initial);
  const [view, setView] = useState<'proof' | 'final'>('proof');
  const [status, setStatus] = useState<{ text: string; tone: '' | 'dirty' | 'ok' }>({
    text: '저장됨',
    tone: '',
  });
  const [pop, setPop] = useState<{ t: PopTarget; x: number; y: number } | null>(null);
  const first = useRef(true);

  const eff = useCallback((id: string) => dec[id] ?? 'a', [dec]);

  /* 결정이 바뀌면 자동 저장 */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus({ text: '저장 중', tone: 'dirty' });
    const t = setTimeout(() => {
      fetch(`/api/proof/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dec }),
      })
        .then((r) =>
          r.ok
            ? setStatus({ text: '저장됨', tone: 'ok' })
            : Promise.reject(new Error(String(r.status))),
        )
        .catch(() => setStatus({ text: '저장하지 못했습니다', tone: 'dirty' }));
    }, 800);
    return () => clearTimeout(t);
  }, [dec, token]);

  const changes: Change[] = useMemo(() => {
    const out: Change[] = [];
    for (const s of doc.sections) {
      for (const b of s.blocks) {
        if (b.t === 'new') out.push({ id: b.id, c: b.c });
        else for (const g of b.seg) if (hasId(g)) out.push({ id: g.id, c: g.c });
      }
      if (s.move) out.push({ id: s.move, c: 'opt' });
    }
    return out;
  }, [doc]);

  const tally = useMemo(() => {
    let a = 0,
      r = 0,
      c = 0;
    for (const g of changes) {
      const v = eff(g.id);
      if (isCustom(v)) c++;
      else if (v === 'r') r++;
      else a++;
    }
    return { a, r, c, total: changes.length };
  }, [changes, eff]);

  const set = (id: string, val: string | null) =>
    setDec((prev) => {
      const next = { ...prev };
      if (val === null) delete next[id];
      else next[id] = val;
      return next;
    });

  const bulk = (fn: (g: Change) => string | null) =>
    setDec(() => {
      const next: Dec = {};
      for (const g of changes) {
        const v = fn(g);
        if (v !== null) next[g.id] = v;
      }
      return next;
    });

  /* 문항별 최종 문단 — 이동 취소 시 원래 자리로 되돌린다 */
  const resolvedSeg = useCallback(
    (g: Extract<Seg, { id: string }>) => {
      const v = eff(g.id);
      if (isCustom(v)) return v.slice(2);
      return v === 'r' ? g.d : g.i;
    },
    [eff],
  );
  const orderedBlocks = useCallback(
    (s: Section) => {
      const blocks = s.blocks.slice();
      if (s.move && eff(s.move) === 'r') {
        const mi = blocks.findIndex((b) => b.t === 'p' && b.moved);
        const moved = mi > 0 ? blocks.splice(mi, 1)[0] : undefined;
        if (moved) blocks.splice(1, 0, moved);
      }
      return blocks;
    },
    [eff],
  );
  const sectionParas = useCallback(
    (s: Section) => {
      const out: string[] = [];
      for (const b of orderedBlocks(s)) {
        if (b.t === 'new') {
          if (eff(b.id) !== 'r') out.push(...b.ps);
          continue;
        }
        const tx = b.seg
          .map((g) => (hasId(g) ? resolvedSeg(g) : g.x))
          .join('')
          .trim();
        if (tx) out.push(tx);
      }
      return out;
    },
    [orderedBlocks, eff, resolvedSeg],
  );
  const finalText = useCallback(() => {
    const L: string[] = [...doc.title, ...doc.meta, ''];
    for (const s of doc.sections) {
      L.push(`${parseInt(s.n, 10)}. ${s.q}`, '');
      const ps = sectionParas(s);
      if (!ps.length) L.push('(답변 없음)');
      for (const p of ps) L.push(p, '');
    }
    return `${L.join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()}\n`;
  }, [doc, sectionParas]);

  const flash = (text: string) => {
    setStatus({ text, tone: 'ok' });
    setTimeout(() => setStatus({ text: '저장됨', tone: '' }), 2200);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(finalText());
      flash('최종본을 복사했습니다');
    } catch {
      flash('복사하지 못했습니다');
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([finalText()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = '정다빈_답변_최종본.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPop = (
    e: React.MouseEvent | React.KeyboardEvent | React.PointerEvent,
    t: PopTarget,
  ) => {
    e.stopPropagation();
    if (pop?.t.id === t.id) return setPop(null);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPop({ t, x: r.left + window.scrollX, y: r.bottom + window.scrollY + 8 });
  };
  useEffect(() => {
    const away = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('.pf-pop') || t?.closest('.pf-chg')) return;
      setPop(null);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setPop(null);
    // pointerdown 으로 듣는다 — iOS 는 span·div 같은 비대화형 요소의 click 을
    // 상위로 올려주지 않아서 document 레벨 click 리스너가 아예 안 불린다.
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  /* ── 렌더 ── */
  const renderSeg = (g: Extract<Seg, { id: string }>, key: number) => {
    const v = eff(g.id);
    const untouched = !(g.id in dec);
    const cls = ['pf-chg', g.c, pop?.t.id === g.id ? 'open' : ''].filter(Boolean).join(' ');
    const target: PopTarget = { id: g.id, c: g.c, d: g.d, i: g.i };
    const common = {
      className: untouched
        ? cls
        : `${cls} ${isCustom(v) ? 'done-c' : v === 'r' ? 'done-r' : 'done-a'}`,
      role: 'button' as const,
      tabIndex: 0,
      // click 이 아니라 pointerup 이다 — iOS Safari 는 span 같은 비대화형 요소의
      // click 을 위로 올려주지 않아 React 위임 핸들러가 아예 안 불린다(모바일에서
      // 눌러도 무반응이던 원인). pointer 이벤트는 요소 종류를 가리지 않는다.
      onPointerUp: (e: React.PointerEvent) => openPop(e, target),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPop(e, target);
        }
      },
    };
    if (untouched)
      return (
        <span key={key} {...common}>
          {g.d !== '' && <del>{g.d}</del>}
          {g.i !== '' && <ins>{g.i}</ins>}
        </span>
      );
    const txt = resolvedSeg(g);
    return (
      <span key={key} {...common}>
        {txt === '' ? '·' : txt}
      </span>
    );
  };

  const renderPara = (b: Extract<Block, { t: 'p' }>, s: Section, key: number) => (
    <p key={key}>
      {b.moved && s.move && (
        <>
          <button
            type="button"
            className="pf-tag move pf-chg"
            onClick={(e) =>
              openPop(e, {
                id: s.move as string,
                c: 'opt',
                d: '원래 순서(두 번째 문단)',
                i: '맨 뒤로 이동',
              })
            }
          >
            {eff(s.move) === 'r' ? '이동 취소됨' : '위치 이동'}
          </button>{' '}
        </>
      )}
      {b.seg.map((g, i) => (hasId(g) ? renderSeg(g, i) : <span key={i}>{g.x}</span>))}
    </p>
  );

  return (
    <div className="pf">
      <div className="pf-bar">
        <div className="pf-bar-in">
          <div className="pf-seg">
            <button type="button" aria-pressed={view === 'proof'} onClick={() => setView('proof')}>
              교정 표시
            </button>
            <button type="button" aria-pressed={view === 'final'} onClick={() => setView('final')}>
              최종본
            </button>
          </div>
          <div className="pf-spacer" />
          <span className={`pf-status ${status.tone}`}>{status.text}</span>
          <button type="button" className="pf-copy" onClick={copy}>
            전체 복사
          </button>
        </div>
      </div>

      {view === 'proof' ? (
        <div className="pf-wrap">
          <header className="pf-head">
            <p className="pf-eyebrow">교정지 · Proof</p>
            <h1 className="pf-h1">
              {doc.title.map((t, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {t}
                </span>
              ))}
            </h1>
            <div className="pf-meta">
              {doc.meta.map((t, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {t}
                </span>
              ))}
            </div>
          </header>

          <div className="pf-tools">
            <div className="pf-tally">
              <span className="a">
                적용 <b>{tally.a}</b>
              </span>
              <span className="r">
                취소 <b>{tally.r}</b>
              </span>
              <span className="c">
                직접 <b>{tally.c}</b>
              </span>
            </div>
            <div className="pf-spacer" />
            <button type="button" className="pf-mini" onClick={() => bulk(() => 'a')}>
              전체 적용
            </button>
            <button type="button" className="pf-mini" onClick={() => bulk(() => 'r')}>
              전체 취소
            </button>
            <button type="button" className="pf-mini" onClick={() => bulk(() => null)}>
              처음으로
            </button>
            <button type="button" className="pf-mini" onClick={download}>
              파일로 내려받기
            </button>
          </div>

          <div className="pf-howto">
            <span>
              <b>표시된 곳을 누르면</b> 적용 · 취소 · 직접 입력을 고를 수 있습니다
            </span>
            <span>
              <b>빨간 취소선</b> 뺀 부분
            </span>
            <span>
              <b>파란 강조</b> 넣은 부분
            </span>
            <span>
              <b>노란색</b> 확인이 필요한 곳
            </span>
            <span>고른 결과는 자동으로 저장됩니다</span>
          </div>

          {doc.sections.map((s) => {
            const blocks = orderedBlocks(s);
            const paras = blocks.filter((b): b is Extract<Block, { t: 'p' }> => b.t === 'p');
            return (
              <section className="pf-sec" key={s.n}>
                <div className="pf-num">{s.n}</div>
                <div className="pf-col">
                  <h2 className="pf-q">{s.q}</h2>
                  {blocks.map((b, bi) =>
                    b.t === 'new' ? (
                      <div className={`pf-blk${eff(b.id) === 'r' ? 'off' : ''}`} key={`n${bi}`}>
                        <div className="pf-blk-bar">
                          <span className="pf-tag">{b.tag}</span>
                          <button
                            className="pf-mini"
                            onClick={() => set(b.id, eff(b.id) === 'r' ? 'a' : 'r')}
                          >
                            {eff(b.id) === 'r' ? '적용하기' : '취소하기'}
                          </button>
                        </div>
                        {b.ps.map((t, i) => (
                          <p key={i}>{t}</p>
                        ))}
                      </div>
                    ) : null,
                  )}
                  {paras.length > 0 && (
                    <div className="pf-body">{paras.map((b, i) => renderPara(b, s, i))}</div>
                  )}
                  {s.note && (
                    <div className="pf-note">
                      {s.noteB && <b>{s.noteB} </b>}
                      {s.note}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          <footer className="pf-foot">
            {doc.footer.map(([h, t], i) => (
              <p key={i}>
                <b>{h}</b> {t}
              </p>
            ))}
            <p>
              <b>현재 상태.</b> 전체 {tally.total}곳 가운데 적용 {tally.a}곳, 취소 {tally.r}곳, 직접
              입력 {tally.c}곳입니다.
            </p>
          </footer>
        </div>
      ) : (
        <div className="pf-final">
          <header className="pf-head">
            <p className="pf-eyebrow">최종본 · Clean</p>
            <h1 className="pf-h1">
              {doc.title.map((t, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {t}
                </span>
              ))}
            </h1>
          </header>
          {doc.sections.map((s) => {
            const ps = sectionParas(s);
            return (
              <div className="pf-fq" key={s.n}>
                <div className="pf-fqn">{s.n}</div>
                <h3 className="pf-fqh">{s.q}</h3>
                {ps.length ? ps.map((t, i) => <p key={i}>{t}</p>) : <p>(답변 없음)</p>}
              </div>
            );
          })}
        </div>
      )}

      {pop && <Pop pop={pop} eff={eff} onPick={set} onClose={() => setPop(null)} />}
    </div>
  );
}

function Pop({
  pop,
  eff,
  onPick,
  onClose,
}: {
  pop: { t: PopTarget; x: number; y: number };
  eff: (id: string) => string;
  onPick: (id: string, v: string | null) => void;
  onClose: () => void;
}) {
  const { t } = pop;
  const v = eff(t.id);
  const [txt, setTxt] = useState(isCustom(v) ? v.slice(2) : t.i);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const pick = (val: string) => {
    onPick(t.id, val);
    onClose();
  };
  const left = Math.max(
    12,
    Math.min(pop.x, window.scrollX + document.documentElement.clientWidth - 352),
  );

  return createPortal(
    <div
      className="pf-pop"
      role="dialog"
      style={{ left, top: pop.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cat">{CATN[t.c]}</div>
      {t.block ? (
        <div className="hint">원문에 없던 문단입니다. 취소하면 답변이 비워집니다.</div>
      ) : (
        <>
          <div className="rowx o">
            <span className="k">원문</span>
            <span className="v">{t.d === '' ? '(없음)' : t.d}</span>
          </div>
          <div className="rowx n">
            <span className="k">수정</span>
            <span className="v">{t.i === '' ? '(삭제)' : t.i}</span>
          </div>
        </>
      )}
      <div className="acts">
        <button aria-pressed={!isCustom(v) && v === 'a'} onClick={() => pick('a')}>
          적용
        </button>
        <button aria-pressed={v === 'r'} onClick={() => pick('r')}>
          취소
        </button>
      </div>
      {!t.block && (
        <>
          <input
            type="text"
            value={txt}
            placeholder="직접 입력해서 바꾸기"
            onChange={(e) => setTxt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                pick(`c:${txt}`);
              }
            }}
          />
          <div className="sub">
            <button onClick={() => pick(`c:${txt}`)}>이 문구로 적용</button>
            {isCustom(v) && <button onClick={() => pick('a')}>되돌리기</button>}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
