import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | gto.today',
  description: 'gto.today 가 어떤 개인정보를 수집하고, 어떻게 쓰며, 언제 파기하는지 안내합니다.',
};

const EFFECTIVE_DATE = '2026-04-22';

export default function PrivacyPage() {
  return (
    <main
      className="safe-pad-x relative mx-auto max-w-2xl"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)',
      }}
    >
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="text-fg-muted font-mono text-[12px] uppercase tracking-[0.2em]"
          aria-label="홈으로"
        >
          ← 홈
        </Link>
        <p className="text-fg-muted/70 font-mono text-[10px] uppercase tracking-[0.24em]">
          v1.0 · {EFFECTIVE_DATE}
        </p>
      </header>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          Privacy
        </p>
        <h1 className="font-display mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
          개인정보처리방침
        </h1>
        <p className="text-body text-fg-muted mt-3">
          gto.today(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요하게 생각하며, 「개인정보
          보호법」을 포함한 관계 법령을 준수합니다. 이 방침은 서비스가 어떤 정보를 수집하고 어떻게
          이용·보관·파기하는지 설명합니다.
        </p>
      </section>

      <article className="text-body mt-10 space-y-10 leading-[1.75]">
        <Section index="1" title="수집하는 개인정보 항목">
          <p>서비스는 다음과 같은 최소한의 개인정보만 수집합니다.</p>
          <ul className="text-fg-muted mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>소셜 로그인 시 제공받는 항목</strong>
              <ul className="mt-1 list-[circle] space-y-1 pl-5">
                <li>구글 로그인: 이메일, 이름, 프로필 사진(선택)</li>
                <li>네이버 로그인: 이메일, 이름</li>
                <li>카카오 로그인: 카카오계정(이메일), 닉네임, 프로필 사진(선택)</li>
              </ul>
            </li>
            <li>
              서비스 이용 중 자동 생성되는 정보: 훈련 기록, 연속 학습 일수, 기기 유형, 접속 IP 로그
            </li>
          </ul>
        </Section>

        <Section index="2" title="개인정보의 수집 및 이용 목적">
          <ul className="text-fg-muted list-disc space-y-1 pl-5">
            <li>회원 식별 및 로그인 유지</li>
            <li>학습 진도 및 연속 훈련 기록을 기기 간 동기화</li>
            <li>서비스 이용 통계 및 품질 개선</li>
            <li>법령 준수 및 부정 이용 방지</li>
          </ul>
          <p className="text-fg-muted mt-3">
            수집된 이메일·이름은 <strong>마케팅·광고 목적으로 절대 사용되지 않습니다.</strong>
          </p>
        </Section>

        <Section index="3" title="보유 및 이용 기간">
          <ul className="text-fg-muted list-disc space-y-1 pl-5">
            <li>회원 정보: 회원 탈퇴 시까지 (탈퇴 요청 시 지체 없이 파기)</li>
            <li>접속 로그: 최대 3개월</li>
            <li>법령에 따라 보존이 필요한 경우: 해당 법령이 정한 기간</li>
          </ul>
        </Section>

        <Section index="4" title="제3자 제공">
          <p>
            서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 법령에 따라 수사기관의 적법한
            요청이 있는 경우에만 관계 법령 범위 내에서 제공될 수 있습니다.
          </p>
        </Section>

        <Section index="5" title="처리 위탁">
          <p>서비스 운영을 위해 다음과 같은 신뢰할 수 있는 국내외 업체에 일부 처리를 위탁합니다.</p>
          <div className="border-hair mt-3 overflow-hidden rounded-xl">
            <table className="w-full font-mono text-[12px]">
              <thead className="bg-bg-elevated text-fg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">수탁자</th>
                  <th className="px-3 py-2 text-left">위탁 업무</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-hair)]">
                <tr>
                  <td className="px-3 py-2">Vercel Inc.</td>
                  <td className="px-3 py-2">서비스 호스팅</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Neon Inc.</td>
                  <td className="px-3 py-2">데이터베이스 호스팅</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Upstash Inc.</td>
                  <td className="px-3 py-2">세션 및 캐시 저장소</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Anthropic PBC</td>
                  <td className="px-3 py-2">
                    AI 해설 생성 (학습 스팟 메타데이터만 전송, 개인정보 미전송)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section index="6" title="이용자의 권리">
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="text-fg-muted mt-2 list-disc space-y-1 pl-5">
            <li>개인정보 열람 및 정정 요구</li>
            <li>개인정보 삭제(회원 탈퇴) 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
          <p className="text-fg-muted mt-3">
            권리 행사는 아래 개인정보 보호책임자 연락처로 요청하시면 지체 없이 처리해 드립니다.
          </p>
        </Section>

        <Section index="7" title="쿠키 및 유사 기술">
          <p>
            서비스는 로그인 세션 유지와 테마 설정 저장을 위해 필수 쿠키만 사용합니다. 광고·추적용
            쿠키는 사용하지 않습니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우
            로그인이 정상적으로 동작하지 않을 수 있습니다.
          </p>
        </Section>

        <Section index="8" title="개인정보 보호책임자">
          <dl className="text-fg-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[13px]">
            <dt>성명</dt>
            <dd>정재호 (Jay Jung)</dd>
            <dt>이메일</dt>
            <dd>
              <a href="mailto:jay@gto.today" className="underline-offset-2 hover:underline">
                jay@gto.today
              </a>
            </dd>
          </dl>
        </Section>

        <Section index="9" title="고지 의무">
          <p>
            이 방침은 법령 또는 서비스 정책에 따라 변경될 수 있으며, 변경 시 시행일 7일 전부터
            서비스 공지사항 또는 이 페이지에 고지합니다. 중대한 변경의 경우 이메일 등 개별 수단으로
            안내할 수 있습니다.
          </p>
          <p className="text-fg-muted mt-3">
            본 개인정보처리방침은 {EFFECTIVE_DATE} 부터 적용됩니다.
          </p>
        </Section>
      </article>

      <footer className="border-t-hair mt-14 pt-6">
        <div className="text-fg-muted flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
          <Link href="/terms" className="hover:text-fg">
            이용약관 →
          </Link>
          <Link href="/" className="hover:text-fg">
            홈
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em]">
        <span className="mr-2 font-mono text-[13px] text-[color:var(--color-accent)]">
          {index}.
        </span>
        {title}
      </h2>
      <div className="text-fg-muted mt-3">{children}</div>
    </section>
  );
}
