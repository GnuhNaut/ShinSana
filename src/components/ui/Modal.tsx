import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  labelledBy?: string
  showClose?: boolean
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, className = '', labelledBy, showClose = true }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const site = document.querySelector<HTMLElement>('.site')
    const siteWasInert = site?.inert ?? false
    document.body.style.overflow = 'hidden'
    document.body.dataset.modalOpen = 'true'
    if (site) site.inert = true

    const dialog = dialogRef.current
    window.setTimeout(() => {
      const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE)
      ;(firstFocusable ?? dialog)?.focus()
    }, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      delete document.body.dataset.modalOpen
      if (site) site.inert = siteWasInert
      const focusTarget = previousFocus.current
      window.setTimeout(() => {
        if (focusTarget?.isConnected && !document.body.dataset.modalOpen) focusTarget.focus({ preventScroll: true })
      }, 0)
    }
  }, [onClose, open])

  if (!open) return null

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={closeFromBackdrop}>
      <div
        ref={dialogRef}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {showClose && (
          <button type="button" className="modal__close icon-button" aria-label={`Đóng ${title}`} onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
