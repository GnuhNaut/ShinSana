import { useEffect, useRef, type RefObject } from 'react';

const focusable = [
  'a[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useModalDialog<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  returnFocus?: RefObject<HTMLElement | null>,
) {
  const dialogRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const returnTarget = returnFocus?.current ?? previous;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const firstTarget = dialog.querySelector<HTMLElement>('[data-autofocus]')
      ?? dialog.querySelector<HTMLElement>(focusable)
      ?? dialog;
    const focusFrame = window.requestAnimationFrame(() => firstTarget.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = [...dialog.querySelectorAll<HTMLElement>(focusable)].filter(
        (node) => !node.hasAttribute('disabled') && node.getClientRects().length > 0,
      );
      if (!nodes.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.requestAnimationFrame(() => returnTarget?.focus());
    };
  }, [open, onClose, returnFocus]);

  return dialogRef;
}
