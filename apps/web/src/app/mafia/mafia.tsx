'use client';

// 마피아 나이트 점수판 — 참가자는 순위·상금·송금 완료를 보고, 관리자(Jay)는 같은 화면에서
// 라운드 결과를 넣고 송금 완료를 누른다. 관리자 키는 주소의 ?k= 로 한 번 받아 이 폰에 저장하고
// /api/mafia 에 헤더로 보낸다. 서버가 안 닿으면 이 기기에만 저장한다(jopt/settle 과 같은 구조).
import { useCallback, useEffect, useMemo, useState } from 'react';
import s from './mafia.module.css';
import {
  DEFAULT_EVENT,
  fmtDay,
  fmtMan,
  fmtMeetAt,
  fmtWon,
  hasPay,
  meetUrl,
  missingPlayers,
  moveInTie,
  newId,
  normalize,
  parseMeetCode,
  payAccount,
  payUrl,
  shareText,
  standings,
  type EventInfo,
  type GameDef,
  type MafiaState,
  type MeetSummary,
  type PayInfo,
  type Round,
  type Standing,
} from './calc';

const LS_KEY = 'mafia-admin-key';
const LS_STATE = 'mafia-state';
const PAGE_URL = 'https://mafia.gto.today';

interface Resp {
  shared: boolean;
  admin: boolean;
  state: MafiaState | null;
  meet?: MeetSummary | null;
  error?: string;
}
interface Patch {
  event?: Partial<EventInfo>;
  players?: string[];
  games?: GameDef[];
  rounds?: Record<string, Round[]>;
  prizes?: number[];
  tiebreak?: string[];
  pay?: Record<string, PayInfo | null>;
  paid?: Record<string, { amount: number } | null>;
  meet?: { code: string };
  /** 서버만 처리 — 모집 페이지 참석자를 참가자로 합친다 */
  syncMeet?: boolean;
  started?: boolean;
}
interface RoundDraft {
  gameId: string;
  /** null 이면 새 라운드 */
  roundId: string | null;
  winners: string[];
  mvp: string;
}

function applyPatch(prev: MafiaState, p: Patch): MafiaState {
  const next: MafiaState = {
    ...prev,
    rounds: { ...prev.rounds },
    paid: { ...prev.paid },
    updatedAt: Date.now(),
  };
  if (p.event) next.event = { ...prev.event, ...p.event };
  if (p.players) next.players = p.players;
  if (p.games) next.games = p.games;
  if (p.rounds) for (const [g, list] of Object.entries(p.rounds)) next.rounds[g] = list;
  if (p.prizes) next.prizes = p.prizes;
  if (p.tiebreak) next.tiebreak = p.tiebreak;
  if (p.pay) {
    const pay = { ...(prev.pay ?? {}) };
    for (const [name, info] of Object.entries(p.pay)) {
      if (info === null) delete pay[name];
      else pay[name] = info;
    }
    next.pay = pay;
  }
  if (p.paid) {
    for (const [name, v] of Object.entries(p.paid)) {
      if (v === null) delete next.paid[name];
      else next.paid[name] = { amount: v.amount, at: Date.now() };
    }
  }
  if (p.meet) next.meet = { code: parseMeetCode(p.meet.code) };
  if (typeof p.started === 'boolean') {
    next.started = p.started;
    next.startedAt = p.started ? prev.startedAt || Date.now() : 0;
  }
  return next;
}

export function Scoreboard() {
  const [key, setKey] = useState<string | null>(null);
  const [keyReady, setKeyReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [state, setState] = useState<MafiaState>(() => normalize(null));
  /** 모집 페이지 요약 — 서버가 포커투데이에서 받아온다 */
  const [meet, setMeet] = useState<MeetSummary | null>(null);
  /** null = 아직 모름, true = 서버 공유, false = 이 기기만 */
  const [shared, setShared] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoundDraft | null>(null);
  const [payEdit, setPayEdit] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newName, setNewName] = useState('');

  // ---- 관리자 키: ?k=… 로 들어오면 저장하고 주소에서 지운다
  useEffect(() => {
    let k: string | null = null;
    try {
      const u = new URL(window.location.href);
      const q = u.searchParams.get('k');
      if (q) {
        localStorage.setItem(LS_KEY, q);
        u.searchParams.delete('k');
        window.history.replaceState(null, '', `${u.pathname}${u.search}${u.hash}`);
      }
      k = localStorage.getItem(LS_KEY);
    } catch {
      /* private mode */
    }
    setKey(k);
    setKeyReady(true);
  }, []);

  const headers = useCallback(
    (): Record<string, string> => (key ? { 'x-mafia-key': key } : {}),
    [key],
  );

  const pull = useCallback(async () => {
    try {
      const r = await fetch('/api/mafia', { cache: 'no-store', headers: headers() });
      const j = (await r.json()) as Resp;
      setAdmin(!!j.admin);
      if (j.meet !== undefined) setMeet(j.meet);
      if (j.shared && j.state) {
        setShared(true);
        setState(normalize(j.state));
        return;
      }
    } catch {
      /* offline */
    }
    setShared((prev) => (prev === true ? prev : false));
  }, [headers]);

  useEffect(() => {
    if (!keyReady) return;
    void pull();
    // 다른 폰에서 바뀐 점수가 보이게 — 화면에 돌아올 때와 30초마다
    const onVis = () => {
      if (document.visibilityState === 'visible') void pull();
    };
    document.addEventListener('visibilitychange', onVis);
    const iv = setInterval(() => {
      if (document.visibilityState === 'visible') void pull();
    }, 30_000);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(iv);
    };
  }, [keyReady, pull]);

  // ---- 서버가 없으면 이 기기에만
  useEffect(() => {
    if (shared !== false) return;
    try {
      const raw = localStorage.getItem(LS_STATE);
      if (raw) setState(normalize(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, [shared]);
  useEffect(() => {
    if (shared !== false || !state.updatedAt) return;
    try {
      localStorage.setItem(LS_STATE, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [shared, state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const patch = useCallback(
    async (p: Patch) => {
      setState((prev) => applyPatch(prev, p));
      if (!shared) return;
      try {
        const r = await fetch('/api/mafia', {
          method: 'PUT',
          headers: { 'content-type': 'application/json', ...headers() },
          body: JSON.stringify(p),
        });
        const j = (await r.json()) as Resp;
        if (r.status === 401) {
          setAdmin(false);
          setToast('관리자 키가 맞지 않습니다.');
          void pull();
          return;
        }
        if (j.meet !== undefined) setMeet(j.meet);
        if (j.shared && j.state) setState(normalize(j.state));
        else {
          setToast(j.error ?? '저장이 안 됐습니다. 다시 눌러 주세요.');
          void pull();
        }
      } catch {
        setToast('저장이 안 됐습니다. 다시 눌러 주세요.');
      }
    },
    [shared, headers, pull],
  );

  const enterKey = () => {
    const k = window.prompt('관리자 키를 넣어 주세요.');
    if (!k) return;
    try {
      localStorage.setItem(LS_KEY, k.trim());
    } catch {
      /* ignore */
    }
    setKey(k.trim());
  };
  const leaveAdmin = () => {
    if (!window.confirm('이 폰에서 관리자 모드를 끌까요? 다시 켜려면 키가 필요합니다.')) return;
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    setKey(null);
    setAdmin(false);
    setSettingsOpen(false);
    setDraft(null);
    setPayEdit(null);
  };

  // ---- 계산
  const rows = useMemo(() => standings(state), [state]);
  const prizePool = useMemo(() => state.prizes.reduce((a, b) => a + b, 0), [state.prizes]);
  const roundCount = useMemo(
    () => state.games.reduce((a, g) => a + (state.rounds[g.id]?.length ?? 0), 0),
    [state.games, state.rounds],
  );
  const paidSum = useMemo(
    () => Object.values(state.paid).reduce((a, m) => a + m.amount, 0),
    [state.paid],
  );

  // ---- 라운드 편집
  const openNew = (g: GameDef) => {
    setDraft({ gameId: g.id, roundId: null, winners: [], mvp: '' });
  };
  const openRound = (g: GameDef, r: Round) => {
    setDraft({ gameId: g.id, roundId: r.id, winners: [...r.winners], mvp: r.mvp ?? '' });
  };
  const toggleWinner = (name: string) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            winners: d.winners.includes(name)
              ? d.winners.filter((w) => w !== name)
              : [...d.winners, name],
          }
        : d,
    );
  };
  const pickMvp = (name: string) => {
    setDraft((d) => (d ? { ...d, mvp: d.mvp === name ? '' : name } : d));
  };
  const saveRound = () => {
    if (!draft) return;
    if (draft.winners.length === 0 && !draft.mvp) {
      setToast('이긴 사람을 한 명 이상 골라 주세요.');
      return;
    }
    const list = [...(state.rounds[draft.gameId] ?? [])];
    const prev = draft.roundId ? list.find((r) => r.id === draft.roundId) : undefined;
    const winners = state.players.filter((p) => draft.winners.includes(p));
    const r: Round = { id: prev?.id ?? newId(), winners, at: prev?.at ?? Date.now() };
    if (draft.mvp) r.mvp = draft.mvp;
    const idx = prev ? list.findIndex((x) => x.id === prev.id) : -1;
    if (idx >= 0) list[idx] = r;
    else list.push(r);
    void patch({ rounds: { [draft.gameId]: list } });
    setDraft(null);
  };
  const deleteRound = () => {
    if (!draft?.roundId) return;
    if (!window.confirm('이 라운드를 지울까요?')) return;
    const list = (state.rounds[draft.gameId] ?? []).filter((r) => r.id !== draft.roundId);
    void patch({ rounds: { [draft.gameId]: list } });
    setDraft(null);
  };

  // ---- 송금 완료
  const togglePaid = (row: Standing) => {
    const mark = state.paid[row.name];
    if (mark) {
      if (!window.confirm(`${row.name} 송금 완료 표시를 지울까요?`)) return;
      void patch({ paid: { [row.name]: null } });
    } else {
      void patch({ paid: { [row.name]: { amount: row.prize } } });
    }
  };

  // ---- 참가자
  const addPlayer = () => {
    const name = newName.trim().replace(/\s+/g, ' ');
    if (!name) return;
    if (state.players.includes(name)) {
      setToast('이미 있는 이름입니다.');
      return;
    }
    void patch({ players: [...state.players, name] });
    setNewName('');
  };
  const removePlayer = (name: string) => {
    if (!window.confirm(`${name}을(를) 명단에서 뺄까요? 넣어 둔 라운드 결과는 남습니다.`)) return;
    void patch({ players: state.players.filter((p) => p !== name) });
    if (payEdit === name) setPayEdit(null);
  };

  // ---- 모집 페이지 → 참가자
  const missing = meet ? missingPlayers(state.players, meet.yes) : [];
  const startGame = () => {
    if (!meet) return;
    const n = meet.yes.length;
    if (
      !window.confirm(
        n
          ? `모집 페이지 참석자 ${n}명을 참가자로 옮기고 게임을 시작할까요?\n${meet.yes.join(', ')}`
          : '모집 페이지에 참석자가 아직 없습니다. 그래도 게임을 시작할까요?',
      )
    )
      return;
    void patch({ syncMeet: true, started: true });
  };
  const syncMeet = () => {
    if (!meet || missing.length === 0) return;
    void patch({ syncMeet: true });
    setToast(`${missing.join(', ')} 추가`);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText(state, rows, PAGE_URL));
      setToast('카톡에 붙일 수 있게 복사했습니다.');
    } catch {
      setToast('복사가 막혔습니다. 길게 눌러 복사해 주세요.');
    }
  };

  const title =
    state.event.title !== DEFAULT_EVENT.title
      ? state.event.title
      : meet?.title || state.event.title;
  const sub =
    [state.event.date, state.event.place].filter(Boolean).join(' · ') ||
    (meet ? [fmtMeetAt(meet.at), meet.place].filter(Boolean).join(' · ') : '');

  return (
    <div className={s.root}>
      <main className={s.wrap}>
        <div className={s.top}>
          <span>Mafia Night</span>
          {admin ? (
            <span className={s.topBtns}>
              <button type="button" className={s.topBtn} onClick={() => setSettingsOpen((v) => !v)}>
                {settingsOpen ? '설정 닫기' : '설정'}
              </button>
              <button type="button" className={`${s.topBtn} ${s.topBtnOn}`} onClick={leaveAdmin}>
                관리자
              </button>
            </span>
          ) : (
            <button type="button" className={s.topBtn} onClick={enterKey}>
              보기 전용
            </button>
          )}
        </div>

        <header className={s.hero}>
          {sub && <div className={s.eyebrow}>{sub}</div>}
          <h1 className={s.title}>{title}</h1>
          {state.event.note && <p className={s.lead}>{state.event.note}</p>}
          <div className={s.stats}>
            <div>
              <small>{!state.started && meet ? '참석 예정' : '참가'}</small>
              <b className={s.num}>
                {!state.started && meet
                  ? `${meet.yes.length}${meet.cap ? `/${meet.cap}` : ''}명`
                  : `${state.players.length}명`}
              </b>
            </div>
            <div>
              <small>상금 풀</small>
              <b className={s.num}>{fmtMan(prizePool)}</b>
            </div>
            <div>
              <small>라운드</small>
              <b className={s.num}>{roundCount}</b>
            </div>
          </div>
          <div className={s.status}>
            {shared === null
              ? '불러오는 중'
              : shared
                ? admin
                  ? !state.started && meet
                    ? '관리자 모드 · 게임 시작을 누르면 참석자가 참가자로 넘어옵니다'
                    : '관리자 모드 · 바꾸면 모두에게 바로 보입니다'
                  : !state.started && meet
                    ? '아직 시작 전 · 참석 여부는 모집 페이지에서 바꿔 주세요'
                    : '순위는 30초마다 새로 받아옵니다'
                : '지금은 이 기기에만 저장됩니다'}
          </div>
        </header>

        {admin && settingsOpen && (
          <Settings
            state={state}
            onSave={(p) => {
              void patch(p);
              setSettingsOpen(false);
              setToast('저장했습니다.');
            }}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* 순위 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>순위</h2>
            <small>
              {paidSum > 0 ? `송금 ${fmtMan(paidSum)} 완료 · ` : ''}점수 → MVP → 승수 순
            </small>
          </div>
          {rows.length === 0 ? (
            <div className={s.empty}>
              {!state.started && meet
                ? `게임 시작을 누르면 참석자 ${meet.yes.length}명이 여기 올라옵니다.`
                : admin
                  ? '아래 참가자 칸에서 이름을 먼저 넣어 주세요.'
                  : '아직 명단이 없습니다.'}
            </div>
          ) : (
            <ol className={s.board}>
              {rows.map((r) => {
                const mark = state.paid[r.name];
                const last = r.rank === rows.length && rows.length > 1;
                const topCls =
                  r.rank === 1 ? s.top1 : r.rank === 2 ? s.top2 : r.rank === 3 ? s.top3 : '';
                return (
                  <li
                    key={r.name}
                    className={`${s.row} ${topCls} ${last ? s.rowLast : ''} ${mark ? s.rowPaid : ''}`}
                  >
                    <div className={`${s.rank} ${s.num}`}>{r.rank}</div>
                    <div className={s.who}>
                      <div className={s.whoName}>
                        <b>{r.name}</b>
                        {r.tied && <span className={s.tag}>동점</span>}
                        {last && <span className={s.tagSad}>ㅠㅠ</span>}
                      </div>
                      <small>
                        승 {r.wins} · MVP {r.mvps}
                        {mark && <span className={s.paidNote}> · 송금 완료 {fmtDay(mark.at)}</span>}
                      </small>
                    </div>
                    <div className={s.pts}>
                      <span className={s.num}>{r.pts}</span>
                      <small>점</small>
                    </div>
                    <div className={`${s.prize} ${s.num}`}>{r.prize ? fmtMan(r.prize) : '·'}</div>
                    {admin && (
                      <div className={s.rowActs}>
                        {r.tied && (
                          <>
                            <button
                              type="button"
                              className={s.mini}
                              aria-label="동점 순서 올리기"
                              onClick={() => void patch({ tiebreak: moveInTie(state, r.name, -1) })}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className={s.mini}
                              aria-label="동점 순서 내리기"
                              onClick={() => void patch({ tiebreak: moveInTie(state, r.name, 1) })}
                            >
                              ↓
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className={mark ? s.btnDone : s.btn}
                          onClick={() => togglePaid(r)}
                        >
                          {mark ? `완료 ${fmtWon(mark.amount)}` : '송금 완료'}
                        </button>
                        {!mark && hasPay(state.pay?.[r.name]) && (
                          <PayActions
                            to={r.name}
                            amount={r.prize}
                            info={state.pay?.[r.name]}
                            onToast={setToast}
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {rows.length > 0 && (
            <div className={s.acts}>
              <button type="button" className={s.act} onClick={copyText}>
                카톡용으로 복사
              </button>
            </div>
          )}
        </section>

        {/* 게임 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>게임</h2>
            <small>
              {admin ? '라운드를 누르면 고칠 수 있습니다' : '라운드마다 이긴 사람과 MVP'}
            </small>
          </div>
          <div className={s.games}>
            {state.games.map((g, gi) => {
              const list = state.rounds[g.id] ?? [];
              const editingHere = draft?.gameId === g.id;
              return (
                <article key={g.id} className={s.game}>
                  <div className={s.gameHead}>
                    <div>
                      <div className={s.gameNo}>GAME {gi + 1}</div>
                      <h3>{g.name}</h3>
                    </div>
                    <div className={s.gameRule}>
                      승 +{g.winPts}
                      {g.mvpPts > 0 && <> · MVP +{g.mvpPts}</>}
                    </div>
                  </div>
                  {list.length === 0 && !editingHere && (
                    <div className={s.gameEmpty}>아직 결과가 없습니다.</div>
                  )}
                  {list.length > 0 && (
                    <ol className={s.rounds}>
                      {list.map((r, i) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            className={`${s.round} ${draft?.roundId === r.id ? s.roundOn : ''}`}
                            onClick={() => (admin ? openRound(g, r) : undefined)}
                            disabled={!admin}
                          >
                            <span className={`${s.roundNo} ${s.num}`}>R{i + 1}</span>
                            <span className={s.roundBody}>
                              <span className={s.roundWin}>
                                {r.winners.length ? r.winners.join(', ') : '이긴 사람 없음'}
                              </span>
                              {r.mvp && <span className={s.roundMvp}>MVP {r.mvp}</span>}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                  {admin && !editingHere && (
                    <button
                      type="button"
                      className={s.addRound}
                      onClick={() => openNew(g)}
                      disabled={state.players.length === 0}
                    >
                      + 라운드 추가
                    </button>
                  )}
                  {admin && editingHere && draft && (
                    <div className={s.editor}>
                      <div className={s.editorHead}>
                        {draft.roundId ? '라운드 고치기' : '새 라운드'} · 이긴 사람을 누르세요
                      </div>
                      <div className={s.chips}>
                        {state.players.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={`${s.chip} ${draft.winners.includes(p) ? s.chipOn : ''}`}
                            onClick={() => toggleWinner(p)}
                            aria-pressed={draft.winners.includes(p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className={s.quick}>
                        <button
                          type="button"
                          className={s.mini}
                          onClick={() => setDraft({ ...draft, winners: [...state.players] })}
                        >
                          전원
                        </button>
                        <button
                          type="button"
                          className={s.mini}
                          onClick={() => setDraft({ ...draft, winners: [] })}
                        >
                          비우기
                        </button>
                        <span className={s.quickNote}>
                          {draft.winners.length}명 · {g.winPts}점씩
                        </span>
                      </div>
                      {g.mvpPts > 0 && (
                        <>
                          <div className={s.editorSub}>MVP (한 명, +{g.mvpPts})</div>
                          <div className={s.chips}>
                            {state.players.map((p) => (
                              <button
                                key={p}
                                type="button"
                                className={`${s.chip} ${s.chipMvp} ${draft.mvp === p ? s.chipMvpOn : ''}`}
                                onClick={() => pickMvp(p)}
                                aria-pressed={draft.mvp === p}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      <div className={s.editorActs}>
                        <button type="button" className={s.btn} onClick={saveRound}>
                          저장
                        </button>
                        <button type="button" className={s.btnGhost} onClick={() => setDraft(null)}>
                          취소
                        </button>
                        {draft.roundId && (
                          <button type="button" className={s.btnDanger} onClick={deleteRound}>
                            지우기
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* 참가자 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>참가자</h2>
            <small>
              {state.players.length}명{admin ? ' · 이름을 누르면 송금처를 넣습니다' : ''}
            </small>
          </div>
          {meet && (
            <div className={s.meet}>
              <div className={s.meetHead}>
                <div className={s.meetInfo}>
                  <div className={s.gameNo}>모집 페이지</div>
                  <b>{meet.title || '제목 없음'}</b>
                  <small>{[fmtMeetAt(meet.at), meet.place].filter(Boolean).join(' · ')}</small>
                </div>
                <a className={s.mini} href={meet.url} target="_blank" rel="noopener noreferrer">
                  열기
                </a>
              </div>
              <div className={s.meetCounts}>
                참석 {meet.yes.length}
                {meet.cap ? `/${meet.cap}` : ''} · 대기 {meet.wait.length} · 미정{' '}
                {meet.maybe.length} · 불참 {meet.noCount}
                {meet.closed ? ' · 마감' : ''}
              </div>
              {!state.started && meet.yes.length > 0 && (
                <div className={s.chips}>
                  {meet.yes.map((n) => (
                    <span key={n} className={`${s.chip} ${s.chipStatic}`}>
                      <span className={s.chipName}>{n}</span>
                    </span>
                  ))}
                </div>
              )}
              {admin && !state.started && (
                <button type="button" className={`${s.btn} ${s.btnWide}`} onClick={startGame}>
                  게임 시작 · 참석 {meet.yes.length}명을 참가자로
                </button>
              )}
              {admin && state.started && missing.length > 0 && (
                <button type="button" className={`${s.btnGhost} ${s.btnWide}`} onClick={syncMeet}>
                  모집 페이지에서 {missing.length}명 더 불러오기 · {missing.join(', ')}
                </button>
              )}
              {admin && state.started && missing.length === 0 && (
                <div className={s.meetNote}>
                  참석자가 모두 참가자에 있습니다
                  {state.startedAt ? ` · 시작 ${fmtDay(state.startedAt)}` : ''}
                </div>
              )}
            </div>
          )}
          {admin && !meet && (
            <div className={s.empty}>
              {state.meet.code
                ? '모집 페이지를 읽지 못했습니다. 잠시 뒤 새로고침해 주세요.'
                : '설정에서 포커투데이 모집 페이지 링크를 붙이면 참석자를 자동으로 불러옵니다.'}
            </div>
          )}
          {state.players.length === 0 && !admin && !meet && (
            <div className={s.empty}>아직 명단이 없습니다.</div>
          )}
          {(state.started || state.players.length > 0) && state.players.length === 0 && admin && (
            <div className={s.empty}>참가자가 없습니다. 아래에서 이름을 넣어 주세요.</div>
          )}
          <div className={s.chips}>
            {state.players.map((p) => {
              const info = state.pay?.[p];
              return (
                <span
                  key={p}
                  className={`${s.chip} ${s.chipStatic} ${payEdit === p ? s.chipOn : ''}`}
                >
                  <button
                    type="button"
                    className={s.chipName}
                    onClick={() => (admin ? setPayEdit(payEdit === p ? null : p) : undefined)}
                    disabled={!admin}
                  >
                    {p}
                    {admin && hasPay(info) && <span className={s.dot} aria-label="송금처 있음" />}
                  </button>
                  {admin && (
                    <button
                      type="button"
                      className={s.chipX}
                      aria-label={`${p} 빼기`}
                      onClick={() => removePlayer(p)}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          {admin && (
            <form
              className={s.addRow}
              onSubmit={(e) => {
                e.preventDefault();
                addPlayer();
              }}
            >
              <input
                className={s.input}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="이름"
                maxLength={24}
                autoComplete="off"
                enterKeyHint="done"
              />
              <button type="submit" className={s.btn} disabled={!newName.trim()}>
                추가
              </button>
            </form>
          )}
          {admin && payEdit && state.players.includes(payEdit) && (
            <PayForm
              key={payEdit}
              name={payEdit}
              info={state.pay?.[payEdit]}
              onSave={(info) => {
                void patch({ pay: { [payEdit]: info } });
                setPayEdit(null);
                setToast(info ? '송금처를 저장했습니다.' : '송금처를 지웠습니다.');
              }}
              onClose={() => setPayEdit(null)}
            />
          )}
        </section>

        {/* 상금표 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>상금</h2>
            <small>합계 {fmtMan(prizePool)}</small>
          </div>
          <ol className={s.prizes}>
            {state.prizes.map((v, i) => (
              <li key={i} className={i < 3 ? s.prizeTop : ''}>
                <span className={s.num}>{i + 1}등</span>
                <b className={s.num}>{fmtMan(v)}</b>
              </li>
            ))}
          </ol>
        </section>

        <footer className={s.foot}>mafia.gto.today</footer>
      </main>

      {toast && (
        <div className={s.toast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

// ---------- 송금 버튼(관리자) ----------

function PayActions({
  to,
  amount,
  info,
  onToast,
}: {
  to: string;
  amount: number;
  info: PayInfo | undefined;
  onToast: (m: string) => void;
}) {
  const url = payUrl(info, amount);
  const acct = payAccount(info);
  if (!url && !acct) return null;
  const copy = async () => {
    if (!acct) return;
    try {
      await navigator.clipboard.writeText(acct);
      onToast(`${to} 계좌를 복사했습니다.`);
    } catch {
      onToast('복사가 막혔습니다.');
    }
  };
  return (
    <>
      {url && (
        <a className={s.btnPay} href={url} target="_blank" rel="noopener noreferrer">
          토스로 보내기
        </a>
      )}
      {acct && (
        <button type="button" className={s.btnGhost} onClick={copy}>
          계좌 복사
        </button>
      )}
    </>
  );
}

// ---------- 송금처 입력(관리자) ----------

function PayForm({
  name,
  info,
  onSave,
  onClose,
}: {
  name: string;
  info: PayInfo | undefined;
  onSave: (info: PayInfo | null) => void;
  onClose: () => void;
}) {
  const [toss, setToss] = useState(info?.toss ?? '');
  const [bank, setBank] = useState(info?.bank ?? '');
  const [acct, setAcct] = useState(info?.acct ?? '');
  const submit = () => {
    const p: PayInfo = {};
    if (toss.trim()) p.toss = toss.trim();
    if (bank.trim()) p.bank = bank.trim();
    if (acct.trim()) p.acct = acct.trim();
    onSave(p.toss || p.acct ? p : null);
  };
  return (
    <form
      className={s.payForm}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className={s.payFormHead}>
        <b>{name}</b> 송금처 · 관리자에게만 보입니다
      </div>
      <input
        className={s.input}
        value={toss}
        onChange={(e) => setToss(e.target.value)}
        placeholder="토스 아이디 (toss.me/아이디)"
        autoComplete="off"
      />
      <div className={s.payFormRow}>
        <input
          className={s.input}
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="은행"
          autoComplete="off"
        />
        <input
          className={s.input}
          value={acct}
          onChange={(e) => setAcct(e.target.value)}
          placeholder="계좌번호"
          inputMode="numeric"
          autoComplete="off"
        />
      </div>
      <div className={s.editorActs}>
        <button type="submit" className={s.btn}>
          저장
        </button>
        <button type="button" className={s.btnGhost} onClick={onClose}>
          닫기
        </button>
      </div>
    </form>
  );
}

// ---------- 설정(관리자): 행사 정보 · 상금표 · 게임 점수 ----------

function Settings({
  state,
  onSave,
  onClose,
}: {
  state: MafiaState;
  onSave: (p: Patch) => void;
  onClose: () => void;
}) {
  const [ev, setEv] = useState<EventInfo>({ ...state.event });
  const [meetLink, setMeetLink] = useState(state.meet.code ? meetUrl(state.meet.code) : '');
  const [prizes, setPrizes] = useState<number[]>([...state.prizes]);
  const [games, setGames] = useState<GameDef[]>(state.games.map((g) => ({ ...g })));
  const sum = prizes.reduce((a, b) => a + b, 0);
  const setPrize = (i: number, v: string) => {
    const n = Math.max(0, Math.round(Number(v.replace(/[^0-9]/g, '')) || 0));
    setPrizes((prev) => prev.map((p, j) => (j === i ? n : p)));
  };
  const setGame = (i: number, patch: Partial<GameDef>) => {
    setGames((prev) => prev.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  };
  return (
    <section className={`${s.sec} ${s.settings}`}>
      <div className={s.secHead}>
        <h2>설정</h2>
        <small>행사 · 상금 · 점수</small>
      </div>
      <div className={s.field}>
        <label htmlFor="ev-meet">모집 페이지 링크 (포커투데이)</label>
        <input
          id="ev-meet"
          className={s.input}
          value={meetLink}
          onChange={(e) => setMeetLink(e.target.value)}
          placeholder="https://poker.gto.today/meet/…"
          autoComplete="off"
          inputMode="url"
        />
        {meetLink.trim() && !parseMeetCode(meetLink) && (
          <small className={s.fieldErr}>
            링크 모양이 아닙니다. /meet/ 뒤 코드가 있어야 합니다.
          </small>
        )}
      </div>
      <div className={s.field}>
        <label htmlFor="ev-title">제목 (비우면 모집 페이지 제목)</label>
        <input
          id="ev-title"
          className={s.input}
          value={ev.title}
          onChange={(e) => setEv({ ...ev, title: e.target.value })}
          maxLength={40}
        />
      </div>
      <div className={s.payFormRow}>
        <div className={s.field}>
          <label htmlFor="ev-date">날짜</label>
          <input
            id="ev-date"
            className={s.input}
            value={ev.date}
            onChange={(e) => setEv({ ...ev, date: e.target.value })}
            placeholder="10/18 (토) 19:00"
            maxLength={40}
          />
        </div>
        <div className={s.field}>
          <label htmlFor="ev-place">장소</label>
          <input
            id="ev-place"
            className={s.input}
            value={ev.place}
            onChange={(e) => setEv({ ...ev, place: e.target.value })}
            placeholder="장소"
            maxLength={60}
          />
        </div>
      </div>
      <div className={s.field}>
        <label htmlFor="ev-note">안내</label>
        <textarea
          id="ev-note"
          className={s.input}
          value={ev.note}
          onChange={(e) => setEv({ ...ev, note: e.target.value })}
          placeholder="참가자에게 보일 한두 줄"
          maxLength={300}
          rows={2}
        />
      </div>

      <div className={s.settingsSub}>
        상금표 <small>합계 {fmtMan(sum)}</small>
      </div>
      <div className={s.prizeGrid}>
        {prizes.map((v, i) => (
          <label key={i} className={s.prizeCell}>
            <span className={s.num}>{i + 1}등</span>
            <input
              className={`${s.input} ${s.num}`}
              inputMode="numeric"
              value={v.toLocaleString('ko-KR')}
              onChange={(e) => setPrize(i, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className={s.quick}>
        <button
          type="button"
          className={s.mini}
          onClick={() => setPrizes((p) => [...p, 0])}
          disabled={prizes.length >= 30}
        >
          + 등수
        </button>
        <button
          type="button"
          className={s.mini}
          onClick={() => setPrizes((p) => p.slice(0, -1))}
          disabled={prizes.length <= 1}
        >
          − 등수
        </button>
      </div>

      <div className={s.settingsSub}>게임 점수</div>
      <div className={s.gameCfg}>
        {games.map((g, i) => (
          <div key={g.id} className={s.gameCfgRow}>
            <input
              className={s.input}
              value={g.name}
              onChange={(e) => setGame(i, { name: e.target.value })}
              maxLength={40}
              aria-label="게임 이름"
            />
            <label>
              승
              <input
                className={`${s.input} ${s.num}`}
                inputMode="numeric"
                value={g.winPts}
                onChange={(e) => setGame(i, { winPts: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
            <label>
              MVP
              <input
                className={`${s.input} ${s.num}`}
                inputMode="numeric"
                value={g.mvpPts}
                onChange={(e) => setGame(i, { mvpPts: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
          </div>
        ))}
      </div>

      <div className={s.editorActs}>
        <button
          type="button"
          className={s.btn}
          onClick={() =>
            onSave({
              event: { ...ev, title: ev.title.trim() || DEFAULT_EVENT.title },
              meet: { code: parseMeetCode(meetLink) },
              prizes,
              games: games.filter((g) => g.name.trim()),
            })
          }
        >
          저장
        </button>
        <button type="button" className={s.btnGhost} onClick={onClose}>
          닫기
        </button>
      </div>
    </section>
  );
}
