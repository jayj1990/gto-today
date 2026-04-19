import { Splash } from '@/components/splash';
import { HomeGate } from '@/components/home-gate';

/**
 * Home — gated on onboarding + sign-in state.
 *
 * First-time visitors are redirected to /onboarding (then /signin). Once
 * both are complete, they see a minimal home with just two cards:
 * 오늘의 훈련 and 실전 모드. The splash component is always mounted but
 * only renders once per session.
 */
export default function HomePage() {
  return (
    <>
      <Splash />
      <HomeGate />
    </>
  );
}
