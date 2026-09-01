'use client';

// ananti.gto.today — 예약 선점 화면 (Jay 전용).
// 날짜 선택 → 지점 → 객실 → 선점 요청. 실제 예약 실행은 맥북 러너가 한다.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CATALOG,
  getPlatform,
  isOpen,
  kstNow,
  openInfo,
  parseYmd,
  ymd,
} from '@/lib/ananti-catalog';
import s from './ananti.module.css';

interface Req {
  id: string;
  platform: string;
  roomName: string;
  stayDate: string;
  source: string;
  status: string;
  folio: string | null;
  amount: number | null;
  lastError: string | null;
  attempts: number;
}
interface Config {
  sweepEnabled: boolean;
  sweepPlatform: string;
  sweepRoom: string;
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const fmtDate = (v: string) =>
  `${v.slice(0, 4)}.${v.slice(4, 6)}.${v.slice(6, 8)} (${DOW[parseYmd(v).getUTCDay()]})`;
const fmtShort = (v: string) =>
  `${+v.slice(4, 6)}/${+v.slice(6, 8)}(${DOW[parseYmd(v).getUTCDay()]})`;
const fmtWon = (n: number) => n.toLocaleString('ko-KR');

export default function AnantiApp({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  return <Keeper onLogout={() => setAuthed(false)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const r = await fetch('/api/ananti/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, pw }),
    });
    setBusy(false);
    if (r.ok) onOk();
    else setErr((await r.json().catch(() => ({}))).error || '로그인에 실패했습니다.');
  };
  return (
    <div className={s.loginRoot}>
      <form className={s.loginBox} onSubmit={submit}>
        <div className={s.loginMark}>ANANTI</div>
        <div className={s.loginSub}>keeper</div>
        <input
          className={s.loginInput}
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoFocus
        />
        <input
          className={s.loginInput}
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className={s.loginBtn} disabled={busy}>
          {busy ? '확인 중' : '로그인'}
        </button>
        {err && <p className={s.loginErr}>{err}</p>}
      </form>
    </div>
  );
}

function Keeper({ onLogout }: { onLogout: () => void }) {
  const [reqs, setReqs] = useState<Req[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [platform, setPlatform] = useState('chord');
  const [selDate, setSelDate] = useState<string | null>(null);
  const [selRoom, setSelRoom] = useState<string | null>(null);
  const [monthOff, setMonthOff] = useState(0);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch('/api/ananti/requests'),
      fetch('/api/ananti/config'),
    ]);
    if (r1.status === 401) {
      onLogout();
      return;
    }
    const j1 = await r1.json();
    const j2 = await r2.json();
    setReqs(j1.rows || []);
    setConfig(j2.config || null);
  }, [onLogout]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const today = ymd(kstNow());

  // 달력 두 달치
  const months = useMemo(() => {
    const base = kstNow();
    return [0, 1].map((i) => {
      const m = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOff + i, 1));
      const year = m.getUTCFullYear();
      const month = m.getUTCMonth();
      const first = new Date(Date.UTC(year, month, 1));
      const days: (string | null)[] = Array(first.getUTCDay()).fill(null);
      const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      for (let d = 1; d <= last; d++) days.push(ymd(new Date(Date.UTC(year, month, d))));
      return { year, month: month + 1, days };
    });
  }, [monthOff]);

  const submitReq = async () => {
    if (!selDate || !selRoom) return;
    setBusy(true);
    const r = await fetch('/api/ananti/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platform, roomName: selRoom, stayDate: selDate }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) {
      say(j.error || '등록에 실패했습니다.');
      return;
    }
    say(
      isOpen(selDate)
        ? '등록됐습니다. 이미 열린 날짜라 10분 안에 예약을 시도합니다.'
        : `등록됐습니다. ${fmtShort(openInfo(selDate).openYmd)} 10:00 오픈과 동시에 시도합니다.`,
    );
    setSelRoom(null);
    load();
  };

  const cancelReq = async (id: string) => {
    const r = await fetch(`/api/ananti/requests/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (!r.ok) say(j.error || '취소에 실패했습니다.');
    load();
  };

  const saveConfig = async (patch: Partial<Config>) => {
    const r = await fetch('/api/ananti/config', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (r.ok) setConfig((await r.json()).config);
  };

  const cat = getPlatform(platform);
  const active = reqs.filter((r) => r.status === 'WAITING' || r.status === 'BOOKED');
  const done = reqs.filter((r) => r.status !== 'WAITING' && r.status !== 'BOOKED');

  return (
    <div className={s.root}>
      <aside className={s.side}>
        <div>
          <div className={s.wordmark}>ANANTI</div>
          <div className={s.wordmarkSub}>keeper</div>
        </div>
        <h1 className={s.sideTitle}>
          잡기 어려운 객실,
          <br />
          오픈과 동시에
          <br />
          선점합니다.
        </h1>
        <p className={s.sideDesc}>
          투숙일이 속한 주는 4주 전 월요일 오전 10시에 열립니다. 원하는 날짜를 미리 등록해 두면 오픈
          시각에 맞춰 자동으로 예약을 넣고, 이미 열린 날짜는 10분 간격으로 바로 시도합니다.
        </p>
        <div className={s.sideFoot}>
          jay 전용 · 예약 접수 후 당일 자정까지 결제 필요
          <br />
          <button
            className={s.logout}
            onClick={async () => {
              await fetch('/api/ananti/login', { method: 'DELETE' });
              onLogout();
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main className={s.main}>
        {/* 날짜 선택 */}
        <section className={s.section}>
          <h2 className={s.secTitle}>
            날짜 선택
            <span className={s.legend}>
              <span>
                <i style={{ background: 'var(--pink-tint)', backgroundColor: '#f6cdd4' }} />
                예약 열림
              </span>
              <span>
                <i style={{ backgroundColor: '#efdf9a' }} />
                오픈 대기
              </span>
            </span>
          </h2>
          <div className={s.calWrap}>
            <button
              className={s.calNav}
              onClick={() => setMonthOff((v) => Math.max(0, v - 1))}
              aria-label="이전 달"
            >
              ‹
            </button>
            {months.map((m) => (
              <div className={s.cal} key={`${m.year}-${m.month}`}>
                <div className={s.calHead}>
                  {m.year}년 {m.month}월
                </div>
                <table className={s.calGrid}>
                  <thead>
                    <tr>
                      {DOW.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(m.days.length / 7) }, (_, w) => (
                      <tr key={w}>
                        {Array.from({ length: 7 }, (_, i) => {
                          const v = m.days[w * 7 + i];
                          if (!v) return <td key={i} />;
                          const passed = v < today;
                          const open = !passed && isOpen(v);
                          const cls = [
                            passed ? s.dPassed : open ? s.dOpen : s.dWait,
                            v === selDate ? s.dSel : '',
                          ].join(' ');
                          return (
                            <td key={i} className={cls}>
                              <button
                                className={s.day}
                                disabled={passed}
                                onClick={() => setSelDate(v)}
                                title={
                                  open
                                    ? '지금 예약 가능 구간'
                                    : `${fmtShort(openInfo(v).openYmd)} 10:00 오픈`
                                }
                              >
                                <span>{+v.slice(6, 8)}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button
              className={s.calNav}
              onClick={() => setMonthOff((v) => Math.min(4, v + 1))}
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
          {selDate && (
            <p className={s.openHint}>
              선택한 날짜는 <b>{fmtDate(selDate)} 1박</b>입니다.{' '}
              {isOpen(selDate) ? (
                '이미 예약이 열린 구간이라 등록 즉시 시도합니다.'
              ) : (
                <>
                  이 날짜는 <b>{fmtShort(openInfo(selDate).openYmd)} 오전 10:00</b>에 열리는데,
                  등록해 두시면 그 시각에 맞춰 자동으로 예약을 넣습니다.
                </>
              )}
            </p>
          )}
        </section>

        {/* 지점 선택 */}
        <section className={s.section}>
          <h2 className={s.secTitle}>지점 선택</h2>
          <div className={s.chips}>
            {Object.entries(CATALOG).map(([k, v]) => (
              <button
                key={k}
                className={`${s.chip} ${platform === k ? s.chipOn : ''}`}
                onClick={() => {
                  setPlatform(k);
                  setSelRoom(null);
                }}
              >
                {v.short}
              </button>
            ))}
          </div>
        </section>

        {/* 객실 선택 */}
        <section className={s.section}>
          <h2 className={s.secTitle}>객실 선택</h2>
          {cat.groups.map((g) => (
            <div className={s.group} key={g.key}>
              {g.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={s.groupImg} src={g.img} alt={g.label} loading="lazy" />
              ) : (
                <div className={s.groupImgPh}>{g.label}</div>
              )}
              <div className={s.groupName}>{g.label}</div>
              <div className={s.roomGrid}>
                {g.rooms.map((r) => (
                  <button
                    key={r.name}
                    className={`${s.roomCard} ${selRoom === r.name ? s.roomCardOn : ''}`}
                    onClick={() => setSelRoom(r.name)}
                  >
                    <span className={s.roomName}>{r.name}</span>
                    <span className={s.roomMeta}>{cat.short} 정회원 요금</span>
                    <span className={s.roomPrice}>
                      {r.price ? (
                        <>
                          {fmtWon(r.price)} ~ <small>/ 1박 기준 (세금포함)</small>
                        </>
                      ) : (
                        <small>요금은 실행 시 확인</small>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 요청 현황 */}
        <section className={s.section}>
          <h2 className={s.secTitle}>선점 현황</h2>
          {active.length === 0 && <div className={s.empty}>등록된 선점 요청이 없습니다.</div>}
          {active.map((r) => (
            <ReqRow key={r.id} r={r} onCancel={cancelReq} />
          ))}
          {done.length > 0 && (
            <>
              <h2 className={s.secTitle} style={{ marginTop: 28 }}>
                지난 요청
              </h2>
              {done.slice(-8).map((r) => (
                <ReqRow key={r.id} r={r} onCancel={cancelReq} />
              ))}
            </>
          )}
        </section>

        {/* 자동 선점 */}
        <section className={s.section}>
          <h2 className={s.secTitle}>매주 자동 선점</h2>
          <div className={s.sweep}>
            <div className={s.sweepInfo}>
              <div className={s.sweepTitle}>월요일 10:00 새로 열리는 주 전체 잡기</div>
              <p className={s.sweepDesc}>
                켜두면 매주 월요일 오전 10시에 새로 열리는 주(월-일) 7일을 아래 객실로 1박씩 전부
                접수합니다. 결제하지 않은 건은 그날 자정에 자동 취소되니 필요한 날만 골라 결제하시면
                됩니다.
              </p>
            </div>
            <div className={s.sweepCtrl}>
              <select
                className={s.select}
                value={config?.sweepPlatform || 'chord'}
                onChange={(e) => {
                  const p = e.target.value;
                  const first = getPlatform(p).groups[0]?.rooms[0]?.name || '';
                  saveConfig({ sweepPlatform: p, sweepRoom: first });
                }}
              >
                {Object.entries(CATALOG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.short}
                  </option>
                ))}
              </select>
              <select
                className={s.select}
                value={config?.sweepRoom || ''}
                onChange={(e) => saveConfig({ sweepRoom: e.target.value })}
              >
                {getPlatform(config?.sweepPlatform || 'chord').groups.flatMap((g) =>
                  g.rooms.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  )),
                )}
              </select>
              <button
                className={`${s.toggle} ${config?.sweepEnabled ? s.toggleOn : ''}`}
                onClick={() => saveConfig({ sweepEnabled: !config?.sweepEnabled })}
                aria-label="자동 선점 켜기/끄기"
              >
                <i />
              </button>
            </div>
          </div>
        </section>

        <div className={s.notice}>
          선점된 예약은 미결제 상태로 잡히며, 접수 당일 자정까지 아난티에서 결제(또는 현장 결제
          등록)하지 않으면 자동 취소됩니다. 예약이 잡히면 이 화면의 선점 현황에 예약번호가 표시되니
          결제만 하시면 됩니다.
        </div>
      </main>

      <div className={s.bottomBar}>
        <button
          className={s.btnGhost}
          onClick={() => {
            setSelDate(null);
            setSelRoom(null);
          }}
        >
          처음부터 다시
        </button>
        <button className={s.btnGo} disabled={!selDate || !selRoom || busy} onClick={submitReq}>
          {selDate && selRoom
            ? `${fmtShort(selDate)} · ${selRoom} 선점 요청`
            : '날짜와 객실을 선택해 주세요'}
        </button>
      </div>

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  );
}

function ReqRow({ r, onCancel }: { r: Req; onCancel: (id: string) => void }) {
  const open = isOpen(r.stayDate);
  const chip =
    r.status === 'BOOKED'
      ? { cls: s.stBooked, label: '예약 완료' }
      : r.status === 'WAITING' && open
        ? { cls: s.stTry, label: '시도 중' }
        : r.status === 'WAITING'
          ? { cls: s.stWait, label: `${fmtShort(openInfo(r.stayDate).openYmd)} 10:00 오픈 대기` }
          : r.status === 'EXPIRED'
            ? { cls: s.stMuted, label: '기간 지남' }
            : { cls: s.stMuted, label: '취소됨' };
  return (
    <div className={s.reqRow}>
      <span className={s.reqDate}>{fmtDate(r.stayDate)}</span>
      <span className={s.reqRoom}>
        {r.roomName}
        <small>
          {CATALOG[r.platform]?.short || r.platform}
          {r.source === 'sweep' ? ' · 자동 선점' : ''}
          {r.attempts > 0 ? ` · 시도 ${r.attempts}회` : ''}
        </small>
      </span>
      <span className={`${s.chipStatus} ${chip.cls}`}>{chip.label}</span>
      {r.status === 'BOOKED' && (
        <span className={s.reqRoom}>
          예약번호 {r.folio}
          {r.amount ? ` · ${r.amount.toLocaleString('ko-KR')}원` : ''}
          <small>오늘 접수된 건이면 자정 전까지 결제해 주세요.</small>
        </span>
      )}
      {r.status === 'WAITING' && (
        <button className={s.reqCancel} onClick={() => onCancel(r.id)}>
          요청 취소
        </button>
      )}
      {r.status === 'WAITING' && r.lastError && (
        <span className={s.reqErr}>최근 시도: {r.lastError}</span>
      )}
    </div>
  );
}
