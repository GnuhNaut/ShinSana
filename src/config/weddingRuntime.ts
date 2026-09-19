/** Applies the configured robots value without coupling the invitation to a demo mode. */
export function applyRuntimeRobots(value: string): () => void {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  const meta = existing ?? document.createElement('meta')
  const previous = existing?.getAttribute('content')

  if (!existing) {
    meta.name = 'robots'
    document.head.appendChild(meta)
  }
  meta.content = value

  return () => {
    if (!existing) meta.remove()
    else if (previous === null || previous === undefined) meta.removeAttribute('content')
    else meta.content = previous
  }
}
