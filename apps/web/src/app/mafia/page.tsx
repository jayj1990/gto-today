import { Scoreboard } from './mafia';

// mafia.gto.today 루트 — 점수판. 데이터는 /api/mafia(KvBlob), 계산은 calc.ts.
export default function MafiaPage() {
  return <Scoreboard />;
}
