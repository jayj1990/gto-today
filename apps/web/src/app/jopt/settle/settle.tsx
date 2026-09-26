'use client';

// 삿포로 정산 화면 — 포커 링게임 정산과 같은 구조: 내가 누구인지 고르면 "보낼 돈·받을 돈"이
// 맨 위에 오고, 전체 최소 송금 목록에서 보낸 사람이 "보냈어요"를 누른다. 체크는 /api/jopt/settle 로
// 모두에게 공유되고(Upstash), 로컬에서 API 가 없으면 이 기기에만 저장한다.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import s from './settle.module.css';
import {
  CHECKS,
  DEFAULT_RATE,
  EXPENSES,
  PEOPLE,
  RECEIPTS,
  type Cur,
  type Expense,
  type Person,
} from './data';
import {
  combinedNets,
  fmt,
  hasPay,
  jpyToKrw,
  netsFor,
  payAccount,
  payUrl,
  settleTransfers,
  shareMap,
  transferKey,
  type PayInfo,
  type Transfer,
} from './calc';

interface PaidMark {
  amount: number;
  at: number;
}
interface State {
  paid: Record<string, PaidMark>;
  /** 받는 사람 송금처(서버에서만 넣는다) */
  pay?: Record<string, PayInfo>;
  updatedAt: number;
}
interface Patch {
  paid?: Record<string, { amount: number } | null>;
}

const LS_ME = 'jopt-settle-me';
const LS_STATE = 'jopt-settle-state';
const EMPTY: State = { paid: {}, updatedAt: 0 };
const PAGE_URL = 'https://jopt.gto.today/jopt/settle';

function applyPatch(prev: State, p: Patch): State {
  const next: State = { ...prev, paid: { ...prev.paid }, updatedAt: Date.now() };
  if (p.paid) {
    for (const [k, v] of Object.entries(p.paid)) {
      if (v === null) delete next.paid[k];
      else next.paid[k] = { amount: v.amount, at: Date.now() };
    }
  }
  return next;
}

function isPerson(v: string | null): v is Person {
  return !!v && (PEOPLE as readonly string[]).includes(v);
}

function fmtDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

export function Settle() {
  const [me, setMe] = useState<Person | null>(null);
  const [state, setState] = useState<State>(EMPTY);
  /** null = 아직 모름, true = 서버 공유, false = 이 기기만 */
  const [shared, setShared] = useState<boolean | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 환율은 890원/100엔 고정(2026-09-26 Jay). 예전에 서버에 저장된 환율 값은 무시한다.
  const rate = DEFAULT_RATE;

  // ---- 불러오기: 서버 → 실패하면 localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem(LS_ME);
      if (isPerson(m)) setMe(m);
    } catch {
      /* private mode */
    }
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch('/api/jopt/settle', { cache: 'no-store' });
        const j = (await r.json()) as { shared: boolean; state: State | null };
        if (!alive) return;
        if (j.shared && j.state) {
          setShared(true);
          setState({ ...EMPTY, ...j.state, paid: j.state.paid ?? {} });
          return;
        }
      } catch {
        /* offline */
      }
      if (!alive) return;
      setShared((prev) => (prev === true ? prev : false));
    };
    void pull();
    // 다른 사람이 누른 체크가 보이게 — 화면에 돌아올 때와 30초마다
    const onVis = () => {
      if (document.visibilityState === 'visible') void pull();
    };
    document.addEventListener('visibilitychange', onVis);
    const iv = setInterval(() => {
      if (document.visibilityState === 'visible') void pull();
    }, 30_000);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    if (shared !== false) return;
    try {
      const raw = localStorage.getItem(LS_STATE);
      if (raw) {
        const st = JSON.parse(raw) as State;
        setState({ ...EMPTY, ...st, paid: st.paid ?? {} });
      }
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
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const patch = useCallback(
    async (p: Patch) => {
      setState((prev) => applyPatch(prev, p));
      if (!shared) return;
      try {
        const r = await fetch('/api/jopt/settle', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(p),
        });
        const j = (await r.json()) as { shared: boolean; state: State | null };
        if (j.shared && j.state) setState({ ...EMPTY, ...j.state, paid: j.state.paid ?? {} });
      } catch {
        setToast('저장이 안 됐습니다. 다시 눌러 주세요.');
      }
    },
    [shared],
  );

  const pickMe = (p: Person) => {
    const next = me === p ? null : p;
    setMe(next);
    try {
      if (next) localStorage.setItem(LS_ME, next);
      else localStorage.removeItem(LS_ME);
    } catch {
      /* ignore */
    }
  };

  // ---- 계산
  const jpyNets = useMemo(() => netsFor(EXPENSES, 'JPY'), []);
  const krwNets = useMemo(() => netsFor(EXPENSES, 'KRW'), []);
  // 원화로 합쳐서만 정산한다(엔·원 따로 모드는 2026-09-26 Jay 가 뺌)
  const transfers = useMemo<Transfer[]>(
    () => settleTransfers(combinedNets(EXPENSES, rate), 'KRW'),
    [rate],
  );
  const doneCount = transfers.filter((t) => state.paid[transferKey(t)]).length;

  const mine = me ? transfers.filter((t) => t.from === me || t.to === me) : [];
  const sumBy = (list: Transfer[], cur: Cur) =>
    list.filter((t) => t.cur === cur).reduce((a, t) => a + t.amount, 0);
  const mySend = mine.filter((t) => t.from === me && !state.paid[transferKey(t)]);
  const myRecv = mine.filter((t) => t.to === me && !state.paid[transferKey(t)]);

  const togglePaid = (t: Transfer) => {
    const key = transferKey(t);
    if (state.paid[key]) {
      if (!window.confirm(`${t.from} → ${t.to} ${fmt(t.amount, t.cur)} 보냈어요 표시를 지울까요?`))
        return;
      void patch({ paid: { [key]: null } });
    } else {
      void patch({ paid: { [key]: { amount: t.amount } } });
    }
  };

  const copyText = async () => {
    const lines = [
      '삿포로 정산 (9/21-25)',
      `엔화는 ${rate}원/100엔으로 환산`,
      '',
      ...transfers.map(
        (t) =>
          `${state.paid[transferKey(t)] ? '✅ ' : ''}${t.from} → ${t.to} ${fmt(t.amount, t.cur)}`,
      ),
      '',
      PAGE_URL,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setToast('카톡에 붙일 수 있게 복사했습니다.');
    } catch {
      setToast('복사가 막혔습니다. 길게 눌러 복사해 주세요.');
    }
  };

  const receiptOf = (id?: string) => (id ? RECEIPTS.find((r) => r.id === id) : undefined);
  const expenseOf = (id?: string) => (id ? EXPENSES.find((e) => e.id === id) : undefined);

  return (
    <div className={s.root}>
      <main className={s.wrap}>
        <div className={s.top}>
          <span>JOPT SAPPORO 2026</span>
          <span className={s.topLinks}>
            <Link href="/jopt">일정표</Link>
            <Link href="/jopt/map">LEGO 지도</Link>
          </span>
        </div>

        <header className={s.hero}>
          <div className={s.eyebrow}>
            9/21-25 · {PEOPLE.length}명 · {EXPENSES.length}건
          </div>
          <h1 className={s.title}>
            삿포로
            <br />
            <em>정산</em>
          </h1>
          <p className={s.lead}>
            지출을 전부 합쳐 사람별 손익을 내고, 송금 횟수가 가장 적게 나오도록 짝을 지었습니다.
            자기 이름을 고르면 보낼 돈과 받을 돈이 맨 위에 뜨고, 보낸 뒤 <b>보냈어요</b>를 누르면
            모두에게 표시됩니다.
          </p>
          <div className={s.status}>
            {shared === null
              ? '불러오는 중'
              : shared
                ? '체크는 모두에게 공유됩니다'
                : '지금은 이 기기에만 저장됩니다'}
          </div>
        </header>

        {/* 나는 누구 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>나는</h2>
            <small>한 번 고르면 이 폰에 기억합니다</small>
          </div>
          <div className={s.chips}>
            {PEOPLE.map((p) => (
              <button
                key={p}
                type="button"
                className={`${s.chip} ${me === p ? s.chipOn : ''}`}
                onClick={() => pickMe(p)}
                aria-pressed={me === p}
              >
                {p}
              </button>
            ))}
          </div>

          {me && (
            <div className={s.me}>
              <div className={s.meGrid}>
                <div>
                  <div className={s.meLabel}>보낼 돈</div>
                  <div className={`${s.meBig} ${s.num}`}>
                    {mySend.length === 0 ? '없음' : fmt(sumBy(mySend, 'KRW'), 'KRW')}
                  </div>
                </div>
                <div>
                  <div className={s.meLabel}>받을 돈</div>
                  <div className={`${s.meBig} ${s.num}`}>
                    {myRecv.length === 0 ? '없음' : fmt(sumBy(myRecv, 'KRW'), 'KRW')}
                  </div>
                </div>
              </div>
              {mine.length > 0 ? (
                <ul className={s.meList}>
                  {mine.map((t) => {
                    const key = transferKey(t);
                    const paid = state.paid[key];
                    const iSend = t.from === me;
                    return (
                      <li key={key} className={paid ? s.meRowDone : ''}>
                        <span className={s.meWho}>
                          {iSend ? (
                            <>
                              <b>{t.to}</b>에게 보내기
                            </>
                          ) : (
                            <>
                              <b>{t.from}</b>에게 받기
                            </>
                          )}
                        </span>
                        <span className={`${s.meAmt} ${s.num}`}>{fmt(t.amount, t.cur)}</span>
                        <button
                          type="button"
                          className={paid ? s.btnDone : iSend ? s.btn : s.btnGhost}
                          onClick={() => togglePaid(t)}
                        >
                          {paid ? '완료' : iSend ? '보냈어요' : '받았어요'}
                        </button>
                        {iSend && !paid && (
                          <PayActions
                            to={t.to}
                            amount={t.amount}
                            info={state.pay?.[t.to]}
                            onToast={setToast}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className={s.meNone}>주고받을 돈이 없습니다.</div>
              )}
            </div>
          )}
        </section>

        {/* 송금 목록 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>누가 누구에게</h2>
            <small>
              {transfers.length}건 중 {doneCount}건 완료 · 엔화 {DEFAULT_RATE}원/100엔
            </small>
          </div>
          <ul className={s.list}>
            {transfers.map((t) => {
              const key = transferKey(t);
              const paid = state.paid[key];
              const isMine = me !== null && (t.from === me || t.to === me);
              const changed = paid && paid.amount !== t.amount;
              return (
                <li
                  key={key}
                  className={`${s.tr} ${paid ? s.trPaid : ''} ${isMine ? s.trMine : ''}`}
                >
                  <div className={s.trWho}>
                    <b>{t.from}</b>
                    <span className={s.arrow}>→</span>
                    <b>{t.to}</b>
                  </div>
                  <div className={`${s.trAmt} ${s.num}`}>
                    {fmt(t.amount, t.cur)}
                    {changed && (
                      <small className={s.changed}>체크 당시 {fmt(paid.amount, t.cur)}</small>
                    )}
                  </div>
                  <button
                    type="button"
                    className={paid ? s.btnDone : s.btnGhost}
                    onClick={() => togglePaid(t)}
                    aria-label={`${t.from}가 ${t.to}에게 ${fmt(t.amount, t.cur)} ${
                      paid ? '보냄 취소' : '보냈어요'
                    }`}
                  >
                    {paid ? `완료 ${fmtDay(paid.at)}` : '보냈어요'}
                  </button>
                  {me === t.from && !paid && (
                    <PayActions
                      to={t.to}
                      amount={t.amount}
                      info={state.pay?.[t.to]}
                      onToast={setToast}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <div className={s.acts}>
            <button type="button" className={s.act} onClick={copyText}>
              카톡용으로 복사
            </button>
          </div>
        </section>

        {/* 사람별 손익 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>사람별 손익</h2>
            <small>+ 받을 돈 · − 보낼 돈 · 정산 전 기준</small>
          </div>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>엔화</th>
                  <th>원화</th>
                  <th>합계(원)</th>
                </tr>
              </thead>
              <tbody>
                {PEOPLE.map((p, i) => {
                  const j = jpyNets[i]?.net ?? 0;
                  const k = krwNets[i]?.net ?? 0;
                  const total = jpyToKrw(j, rate) + k;
                  return (
                    <tr key={p} className={me === p ? s.rowMe : ''}>
                      <td>{p}</td>
                      <td className={`${s.num} ${j > 0 ? s.pos : j < 0 ? s.neg : ''}`}>
                        {j ? fmt(j, 'JPY') : '·'}
                      </td>
                      <td className={`${s.num} ${k > 0 ? s.pos : k < 0 ? s.neg : ''}`}>
                        {k ? fmt(k, 'KRW') : '·'}
                      </td>
                      <td className={`${s.num} ${total > 0 ? s.pos : total < 0 ? s.neg : ''}`}>
                        {total ? fmt(total, 'KRW') : '·'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 항목별 내역 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>항목별 내역</h2>
            <small>
              {me
                ? `${me} 포함 항목은 파란 줄 · 누르면 펼쳐집니다`
                : '누르면 사람별 부담이 펼쳐집니다'}
            </small>
          </div>
          <div className={s.exps}>
            {EXPENSES.map((e) => (
              <ExpenseCard
                key={e.id}
                e={e}
                open={open === e.id}
                me={me}
                receipt={receiptOf(e.receipt)}
                onToggle={() => setOpen(open === e.id ? null : e.id)}
                onReceipt={(src) => setLightbox(src)}
              />
            ))}
          </div>
        </section>

        {/* 영수증 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>영수증</h2>
            <small>대한항공카드 청구 캡처 {RECEIPTS.length}장 · 누르면 크게</small>
          </div>
          <div className={s.rGrid}>
            {RECEIPTS.map((r) => {
              const e = expenseOf(r.expense);
              return (
                <figure key={r.id} className={s.rItem}>
                  <button
                    type="button"
                    className={s.rBtn}
                    onClick={() => setLightbox(r.src)}
                    aria-label={`${r.merchant} 영수증 크게 보기`}
                  >
                    <Image
                      src={r.src}
                      alt={`${r.merchant} 카드 승인 캡처`}
                      width={630}
                      height={800}
                    />
                  </button>
                  <figcaption>
                    <b className={s.num}>{r.krw.toLocaleString('ko-KR')}원</b>
                    <span className={s.num}>{r.at}</span>
                    <span className={e ? s.rLink : s.rNone}>{e ? e.title : '항목 미배정'}</span>
                    {r.note && <small>{r.note}</small>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* 확인 필요 */}
        <section className={s.sec}>
          <div className={s.secHead}>
            <h2>확인이 필요한 것</h2>
            <small>메모와 영수증이 안 맞거나 빠진 부분</small>
          </div>
          <ul className={s.checks}>
            {CHECKS.map((c) => (
              <li key={c.slice(0, 24)}>{c}</li>
            ))}
          </ul>
        </section>

        <footer className={s.foot}>
          <div className={s.footLinks}>
            <Link href="/jopt">9/22 일정표</Link>
            <Link href="/jopt/map">LEGO 동선 지도</Link>
          </div>
          2026. 9. 25 재호 메모 기준. 균등 분담에서 남는 1엔 단위는 결제자가 지고, 원화 합산의
          반올림 차이는 금액이 가장 큰 사람에게 몰아 합이 0이 되게 맞췄습니다. 송금 짝은 횟수가 가장
          적은 조합이라 실제로 돈을 낸 사람과 받는 사람이 다를 수 있습니다.
        </footer>
      </main>

      {lightbox && (
        <div
          className={s.lb}
          role="dialog"
          aria-modal="true"
          aria-label="영수증"
          onClick={() => setLightbox(null)}
        >
          <Image
            src={lightbox}
            alt="영수증 크게 보기"
            width={1260}
            height={1600}
            className={s.lbImg}
          />
          <button type="button" className={s.lbClose} aria-label="닫기">
            ×
          </button>
        </div>
      )}

      {toast && (
        <div className={s.toast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function ExpenseCard({
  e,
  open,
  me,
  receipt,
  onToggle,
  onReceipt,
}: {
  e: Expense;
  open: boolean;
  me: Person | null;
  receipt?: { src: string; merchant: string; krw: number } | undefined;
  onToggle: () => void;
  onReceipt: (src: string) => void;
}) {
  const shares = shareMap(e);
  const rows = [...shares.entries()].sort((a, b) => b[1] - a[1]);
  const mineShare = me ? (shares.get(me) ?? 0) : 0;
  // 내가 낸 항목이거나 내 몫이 있는 항목은 카드째 파란 줄로, 나와 무관한 항목은 흐리게(2026-09-26 Jay)
  const involved = me !== null && (e.payer === me || mineShare > 0);
  const mark = me === null ? '' : involved ? s.expMine : s.expOut;
  return (
    <article className={`${s.exp} ${open ? s.expOpen : ''} ${mark}`}>
      <button type="button" className={s.expHead} onClick={onToggle} aria-expanded={open}>
        <span className={s.expTitle}>
          <b>{e.title}</b>
          <small className={s.num}>{e.date}</small>
        </span>
        <span className={s.expRight}>
          <b className={s.num}>{fmt(e.total, e.cur)}</b>
          <small>
            {e.payer === me ? '내가 결제' : `${e.payer} 결제`}
            {me && mineShare ? ` · 내 몫 ${fmt(mineShare, e.cur)}` : ''}
          </small>
        </span>
      </button>
      {open && (
        <div className={s.expBody}>
          <ul className={s.shares}>
            {rows.map(([name, amt]) => {
              const pre = e.prepaid?.includes(name);
              return (
                <li
                  key={name}
                  className={`${name === me ? s.shareMe : ''} ${pre ? s.sharePre : ''}`}
                >
                  <span>
                    {name}
                    {name === e.payer && <em className={s.tag}>결제</em>}
                    {pre && <em className={s.tagOk}>입금 완</em>}
                  </span>
                  <b className={s.num}>{fmt(amt, e.cur)}</b>
                </li>
              );
            })}
          </ul>
          {e.note && <p className={s.expNote}>{e.note}</p>}
          {receipt && (
            <button type="button" className={s.rChip} onClick={() => onReceipt(receipt.src)}>
              영수증 · {receipt.merchant} ·{' '}
              <span className={s.num}>{receipt.krw.toLocaleString('ko-KR')}원</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// 보내는 사람에게만 뜨는 송금 액션 — 토스 링크(금액까지 채워짐)와 계좌 복사. 받는 사람 송금처가 없으면 안 뜬다.
function PayActions({
  to,
  amount,
  info,
  onToast,
}: {
  to: Person;
  amount: number;
  info: PayInfo | undefined;
  onToast: (msg: string) => void;
}) {
  if (!hasPay(info)) return null;
  const url = payUrl(info, amount);
  const acct = payAccount(info);
  const copy = async () => {
    if (!acct) return;
    try {
      await navigator.clipboard.writeText(`${acct} ${to}`);
      onToast(`${to} 계좌를 복사했습니다.`);
    } catch {
      onToast('복사가 막혔습니다. 길게 눌러 복사해 주세요.');
    }
  };
  return (
    <div className={s.payRow}>
      {url && (
        <a className={s.btn} href={url} target="_blank" rel="noreferrer">
          토스로 {fmt(amount, 'KRW')} 보내기
        </a>
      )}
      {acct && (
        <button type="button" className={s.btnGhost} onClick={copy}>
          계좌 복사 · <span className={s.num}>{acct}</span>
        </button>
      )}
    </div>
  );
}
