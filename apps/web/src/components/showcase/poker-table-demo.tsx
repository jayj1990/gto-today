'use client';

import { CardView, PokerTable } from '@gto/ui';

/**
 * Showcase-only client island for the two PokerTable demos. PokerTable
 * carries 'use client' itself (because of the SFX useEffect), and the
 * server-component page can't pass its renderCard function across the
 * server/client boundary — so this thin wrapper holds the function.
 */
export function PokerTableDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className="text-fg-muted mb-2 font-mono text-[11px]">6-max · BTN (RFI)</p>
        <PokerTable
          format="6max"
          hero="BTN"
          toAct="BTN"
          heroCards={['As', 'Kh']}
          pot={1.5}
          effectiveStack={100}
          renderCard={(code, size) => (
            <CardView
              rank={code.charAt(0)}
              suit={code.charAt(1) as 's' | 'h' | 'd' | 'c'}
              size={size}
              deckScheme="four-color"
            />
          )}
          seats={{
            UTG: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            MP: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            CO: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            BTN: { stack: 100 },
            SB: { stack: 99.5, post: 0.5, showBacks: true },
            BB: { stack: 99, post: 1, showBacks: true },
          }}
        />
      </div>
      <div>
        <p className="text-fg-muted mb-2 font-mono text-[11px]">6-max · BB facing raise</p>
        <PokerTable
          format="6max"
          hero="BB"
          toAct="BB"
          heroCards={['Qs', 'Qd']}
          pot={4}
          effectiveStack={100}
          lastBet={2.5}
          renderCard={(code, size) => (
            <CardView
              rank={code.charAt(0)}
              suit={code.charAt(1) as 's' | 'h' | 'd' | 'c'}
              size={size}
              deckScheme="four-color"
            />
          )}
          seats={{
            UTG: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            MP: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            CO: { stack: 100, action: { kind: 'fold' }, showBacks: true },
            BTN: { stack: 97.5, action: { kind: 'raise', bb: 2.5 }, showBacks: true },
            SB: { stack: 99.5, post: 0.5, showBacks: true },
            BB: { stack: 99, post: 1 },
          }}
        />
      </div>
    </div>
  );
}
