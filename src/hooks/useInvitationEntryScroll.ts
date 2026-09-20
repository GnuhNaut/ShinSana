import { useCallback, useLayoutEffect, useRef } from 'react';

type InvitationEntryScrollBootstrap = {
  originalScrollRestoration?: ScrollRestoration;
  initialHash?: string;
  pending: boolean;
};

declare global {
  interface Window {
    __invitationEntryScroll?: InvitationEntryScrollBootstrap;
  }
}

type InlineScrollStyles = {
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  htmlScrollBehavior: string;
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  bodyPaddingRight: string;
};

function restorationModeFromBootstrap(): ScrollRestoration | undefined {
  const earlyMode = window.__invitationEntryScroll?.originalScrollRestoration;
  if (earlyMode === 'auto' || earlyMode === 'manual') return earlyMode;
  return 'scrollRestoration' in window.history ? window.history.scrollRestoration : undefined;
}

function restoreInitialHash(bootstrap: InvitationEntryScrollBootstrap | undefined) {
  if (!bootstrap?.initialHash || window.location.hash === bootstrap.initialHash) return;
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${bootstrap.initialHash}`,
  );
}

/**
 * Owns the short-lived scroll lock used while the invitation entry is pending.
 * The returned method is safe to call directly in the opening activation handler,
 * before the state update which removes the entry overlay.
 */
export function useInvitationEntryScroll(opened: boolean): { normalizeTop: () => void } {
  const openedRef = useRef(opened);
  openedRef.current = opened;

  const normalizeTop = useCallback(() => {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    // Assigning the roots as well as calling scrollTo covers WebKit's two scroll roots.
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    html.style.scrollBehavior = previousScrollBehavior;
  }, []);

  useLayoutEffect(() => {
    const bootstrap = window.__invitationEntryScroll;
    const originalRestoration = restorationModeFromBootstrap();

    if (opened) {
      normalizeTop();
      if ('scrollRestoration' in window.history && originalRestoration) {
        window.history.scrollRestoration = originalRestoration;
      }
      restoreInitialHash(bootstrap);
      if (bootstrap) bootstrap.pending = false;
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const saved: InlineScrollStyles = {
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      htmlScrollBehavior: html.style.scrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      bodyPaddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const bodyPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    if (bootstrap) bootstrap.pending = true;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    normalizeTop();
    html.style.scrollBehavior = 'auto';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    if (scrollbarWidth > 0) body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;

    // These are individual lifecycle corrections, not a polling/rAF scroll loop.
    const normalizePendingEntry = () => {
      if (!openedRef.current && window.__invitationEntryScroll?.pending !== false) {
        normalizeTop();
      }
    };

    window.addEventListener('pageshow', normalizePendingEntry);
    window.addEventListener('load', normalizePendingEntry);
    window.addEventListener('hashchange', normalizePendingEntry);

    return () => {
      window.removeEventListener('pageshow', normalizePendingEntry);
      window.removeEventListener('load', normalizePendingEntry);
      window.removeEventListener('hashchange', normalizePendingEntry);

      // Establish the intended position while both scrolling roots are still locked.
      normalizeTop();
      html.style.overflow = saved.htmlOverflow;
      html.style.overscrollBehavior = saved.htmlOverscrollBehavior;
      html.style.scrollBehavior = saved.htmlScrollBehavior;
      body.style.overflow = saved.bodyOverflow;
      body.style.overscrollBehavior = saved.bodyOverscrollBehavior;
      body.style.paddingRight = saved.bodyPaddingRight;

      if ('scrollRestoration' in window.history && originalRestoration) {
        window.history.scrollRestoration = originalRestoration;
      }
      // During the development StrictMode replay the invitation is still pending;
      // only the real closed -> opened transition ends bootstrap ownership.
      if (openedRef.current) {
        restoreInitialHash(bootstrap);
        if (bootstrap) bootstrap.pending = false;
      }
    };
  }, [normalizeTop, opened]);

  return { normalizeTop };
}
