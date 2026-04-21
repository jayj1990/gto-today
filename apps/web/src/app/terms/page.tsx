import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | gto.today',
  description: 'gto.today 서비스를 이용하는 데 적용되는 약관입니다.',
};

const EFFECTIVE_DATE = '2026-04-22';

export default function TermsPage() {
  return (
    <main
      className="relative mx-auto max-w-2xl safe-pad-x"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)',
      }}
    >
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted"
          aria-label="홈으로"
        >
          ← 홈
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fg-muted/70">
          v1.0 · {EFFECTIVE_DATE}
        </p>
      </header>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          Terms
        </p>
        <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
          이용약관
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          이 약관은 gto.today(이하 &quot;서비스&quot;)와 이용자 간의 권리·의무 및 책임사항, 서비스
          이용에 관한 기본적인 사항을 규정하는 것을 목적으로 합니다.
        </p>
      </section>

      <article className="mt-10 space-y-10 text-body leading-[1.75]">
        <Section index="1" title="목적">
          <p>
            본 약관은 이용자가 서비스를 이용함에 있어 서비스와 이용자의 권리·의무 및 책임사항을
            규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section index="2" title="용어의 정의">
          <ul className="list-disc space-y-1 pl-5 text-fg-muted">
            <li>
              <strong>서비스</strong> — gto.today 웹·모바일 애플리케이션 및 이에 부수되는 모든 기능을
              의미합니다.
            </li>
            <li>
              <strong>이용자</strong> — 본 약관에 따라 서비스를 이용하는 개인을 말합니다.
            </li>
            <li>
              <strong>회원</strong> — 소셜 로그인을 통해 서비스에 가입한 이용자를 말합니다.
            </li>
            <li>
              <strong>콘텐츠</strong> — 서비스가 제공하는 포커 전략 데이터, AI 해설, 훈련 기록 등을
              말합니다.
            </li>
          </ul>
        </Section>

        <Section index="3" title="약관의 효력 및 변경">
          <p>
            본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이 발생합니다. 서비스는
            필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있으며, 변경 시
            시행일 7일 전부터 서비스 내 공지사항을 통해 고지합니다. 변경된 약관의 시행일 이후에도
            서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주됩니다.
          </p>
        </Section>

        <Section index="4" title="서비스의 제공 및 변경">
          <p>서비스는 다음과 같은 기능을 제공합니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
            <li>포커 GTO 전략 학습 콘텐츠 및 일일 퀴즈</li>
            <li>무한 훈련 모드 및 실전 시뮬레이터</li>
            <li>포스트플랍 라이브 솔버(베타)</li>
            <li>AI 해설 및 개인화된 학습 기록</li>
          </ul>
          <p className="mt-3 text-fg-muted">
            서비스는 운영상·기술상 필요에 따라 제공 기능의 전부 또는 일부를 변경하거나 중단할 수
            있으며, 중단 시 가능한 범위에서 사전에 공지합니다.
          </p>
        </Section>

        <Section index="5" title="회원가입 및 계정">
          <p>
            회원가입은 이용자가 소셜 로그인(구글·네이버·카카오)을 통해 서비스에 접속함으로써
            완료됩니다. 회원은 자신의 계정 정보 보안을 스스로 유지할 책임이 있으며, 계정을 타인에게
            양도·대여할 수 없습니다. 회원 탈퇴는 마이페이지에서 언제든 요청할 수 있습니다.
          </p>
        </Section>

        <Section index="6" title="이용자의 의무">
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
            <li>타인의 계정 또는 개인정보를 도용하는 행위</li>
            <li>서비스의 소스코드·데이터를 무단으로 복제·배포하거나 역설계하는 행위</li>
            <li>자동화 도구(크롤러 등)를 이용하여 서비스에 비정상적으로 접근하는 행위</li>
            <li>관련 법령 또는 공서양속에 반하는 행위</li>
          </ul>
        </Section>

        <Section index="7" title="지적재산권">
          <p>
            서비스가 제공하는 콘텐츠의 저작권 및 기타 지적재산권은 서비스 또는 정당한 권리자에게
            귀속됩니다. 이용자는 개인적·비상업적 용도로만 콘텐츠를 이용할 수 있으며, 사전 동의 없이
            복제·전송·배포·2차 가공할 수 없습니다.
          </p>
        </Section>

        <Section index="8" title="서비스의 중단 및 제한">
          <p>
            서비스는 천재지변, 정전, 시스템 점검, 제3자 서비스 장애 등 불가항력적 사유가 발생한 경우
            서비스 제공을 일시 중단할 수 있습니다. 이용자가 본 약관을 중대하게 위반한 경우 서비스는
            사전 통지 없이 이용을 제한하거나 계정을 정지할 수 있습니다.
          </p>
        </Section>

        <Section index="9" title="책임의 제한">
          <p>
            서비스가 제공하는 포커 전략 데이터 및 AI 해설은 학습·교육 목적의 참고 자료이며, 특정
            게임의 승패를 보장하지 않습니다. 서비스는 이용자가 본 정보를 바탕으로 행한 의사결정에 대해
            법적 책임을 지지 않습니다. 또한 서비스는 관련 법령에서 허용하는 최대 범위에서 간접적·결과적
            손해에 대해 책임을 지지 않습니다.
          </p>
        </Section>

        <Section index="10" title="준거법 및 관할">
          <p>
            본 약관은 대한민국 법령에 따라 해석되며, 서비스와 이용자 간 분쟁에 관한 소송의 관할 법원은
            「민사소송법」에 따른 관할 법원으로 합니다.
          </p>
        </Section>

        <Section index="11" title="문의">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[13px] text-fg-muted">
            <dt>운영자</dt>
            <dd>정재호 (Jay Jung)</dd>
            <dt>이메일</dt>
            <dd>
              <a
                href="mailto:jay@gto.today"
                className="underline-offset-2 hover:underline"
              >
                jay@gto.today
              </a>
            </dd>
          </dl>
          <p className="mt-4 text-fg-muted">
            본 약관은 {EFFECTIVE_DATE} 부터 적용됩니다.
          </p>
        </Section>
      </article>

      <footer className="mt-14 border-t-hair pt-6">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          <Link href="/privacy" className="hover:text-fg">
            개인정보처리방침 →
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
          제{index}조
        </span>
        {title}
      </h2>
      <div className="mt-3 text-fg-muted">{children}</div>
    </section>
  );
}
