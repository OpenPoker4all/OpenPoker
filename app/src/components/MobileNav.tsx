import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { PHONE_MENU_EMBLEM } from '../lib/menuArt';
import { activeNavKey, PHONE_NAV } from '../lib/phoneNav';

/**
 * The phone's primary navigation, as on the mobile reference: Poker, Tournaments, a raised round
 * brand button for Home in the centre, Casino and Organizers. The profile is the avatar at the top right.
 * Every icon plays the same lift-and-tilt when tapped.
 */
export function MobileNav() {
  const { route, navigate, brand } = useApp();
  const [flipping, setFlipping] = useState<string | null>(null);
  const [path] = route.split('?');
  if (path.startsWith('/table') || path.startsWith('/login')) return null;
  const active = activeNavKey(route);
  return (
    <nav className="mobile-nav" aria-label="Primary" style={{ gridTemplateColumns: `repeat(${PHONE_NAV.length}, 1fr)` }}>
      {PHONE_NAV.map((item) => {
        const on = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            aria-current={on ? 'page' : undefined}
            className={'mobile-nav-item' + (on ? ' on' : '') + (item.kind === 'brand' ? ' center' : '')}
            onClick={() => { if (item.kind === 'glyph') setFlipping(item.key); navigate(item.to); }}
          >
            {item.kind === 'glyph' && <img className={'mobile-nav-emblem' + (flipping === item.key ? ' flip' : '')} src={PHONE_MENU_EMBLEM[item.glyph]} alt="" onAnimationEnd={() => setFlipping(null)} />}
            {item.kind === 'brand' && <img className="mobile-nav-brand" src={brand.logo} alt="" />}
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
