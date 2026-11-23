import React from 'react';
import { useApp } from '../../lib/store';
import { Avatar } from '../Avatar';
import { NavGlyph } from './PhoneIcons';
import { landingRoute } from '../../lib/phoneNav';

/**
 * Phone chrome: one 54px bar replacing the desktop title bar, tabs and account rail.
 * Left is back when needed, then the brand pinned left (or a centred page title), right is the one-line
 * Play Money balance and Profile.
 */
export function MobileTopBar({ title, showBrand = false }: { title?: string; showBrand?: boolean }) {
  const { user, navigate, brand, route, dmUnread, meta } = useApp();
  const online = Number(meta?.online) || 0;
  const path = route.split('?')[0];
  const isRoot = ['/', '/casino', '/rewards', '/my-page'].includes(path) || route.includes('play=1');
  const showBack = Boolean(title) || ['/contributor', '/organiser'].includes(path);
  const back = () => {
    if (!isRoot && window.history.length > 1) window.history.back();
    else navigate('/');
  };
  return (
    <header className="p-topbar">
      {showBack ? (
        <button type="button" className="p-icon-btn" aria-label="Back" onClick={back}>
          <NavGlyph name="back" size={22} />
        </button>
      ) : (showBrand && !title ? null : <span className="p-topbar-spacer" aria-hidden="true" />)}
      <div className={'p-topbar-mid' + (showBrand && !title ? ' is-brand' : '')}>
        {title ? <b className="p-topbar-title">{title}</b> : showBrand ? (
          <button type="button" className="p-topbar-home" aria-label="DanGG home" onClick={() => navigate(landingRoute(true))}>
            <img src={brand.logo} alt="" className="p-topbar-logo" />
            {online > 0 && <span className="p-online"><i aria-hidden="true" />{online.toLocaleString()} online</span>}
          </button>
        ) : <span />}
      </div>
      <div className="p-topbar-actions">
        <button type="button" className="p-wallet" aria-label="Open cashier" onClick={() => navigate(user ? '/cashier' : '/login')}>
          {user ? <b>Play Money {Math.round(user.balance / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</b> : <b>Log in</b>}
        </button>
        <button type="button" className="p-avatar-btn" aria-label={user ? 'My Page' : 'Log in'} onClick={() => navigate(user ? '/my-page' : '/login')}>
          <Avatar name={user?.nick || 'Guest'} src={user?.avatar} size={34} />
          {dmUnread > 0 && <i className="p-dot" />}
        </button>
      </div>
    </header>
  );
}
