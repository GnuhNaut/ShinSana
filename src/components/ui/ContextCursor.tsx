import { useEffect, useRef, useState } from 'react'

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** A small, opt-in cursor that is never mounted for touch or reduced-motion users. */
export function ContextCursor() {
  const [enabled, setEnabled] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const targetRef = useRef({ x: -80, y: -80 })
  const positionRef = useRef({ x: -80, y: -80 })
  const visibleRef = useRef(false)

  useEffect(() => {
    const finePointer = window.matchMedia(FINE_POINTER_QUERY)
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches)
    update()
    finePointer.addEventListener?.('change', update)
    reducedMotion.addEventListener?.('change', update)
    return () => {
      finePointer.removeEventListener?.('change', update)
      reducedMotion.removeEventListener?.('change', update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const cursor = cursorRef.current
    if (!cursor) return

    document.documentElement.classList.add('has-context-cursor')

    const paint = (x: number, y: number) => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`
    }

    const settle = () => {
      const position = positionRef.current
      const target = targetRef.current
      const deltaX = target.x - position.x
      const deltaY = target.y - position.y
      if (Math.abs(deltaX) < .3 && Math.abs(deltaY) < .3) {
        positionRef.current = { ...target }
        paint(target.x, target.y)
        frameRef.current = null
        return
      }
      positionRef.current = { x: position.x + deltaX * .28, y: position.y + deltaY * .28 }
      paint(positionRef.current.x, positionRef.current.y)
      frameRef.current = window.requestAnimationFrame(settle)
    }

    const scheduleSettle = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(settle)
    }

    const hide = () => {
      visibleRef.current = false
      cursor.dataset.visible = 'false'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        hide()
        return
      }
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-context-cursor]')
        : null
      const label = target?.dataset.contextCursor
      if (!label) {
        hide()
        return
      }

      targetRef.current = { x: event.clientX, y: event.clientY }
      if (!visibleRef.current) {
        positionRef.current = { ...targetRef.current }
        paint(event.clientX, event.clientY)
      }
      visibleRef.current = true
      cursor.dataset.visible = 'true'
      cursor.textContent = label
      scheduleSettle()
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerup', hide, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('blur', hide)
    window.addEventListener('scroll', hide, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', hide)
      document.documentElement.removeEventListener('mouseleave', hide)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('blur', hide)
      window.removeEventListener('scroll', hide)
      document.documentElement.classList.remove('has-context-cursor')
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [enabled])

  if (!enabled) return null

  return <div className="context-cursor" ref={cursorRef} data-visible="false" aria-hidden="true" />
}
