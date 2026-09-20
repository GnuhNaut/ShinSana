type ArrowDirection = 'left' | 'right' | 'external';

export function ArrowIcon({ direction = 'right' }: { direction?: ArrowDirection }) {
  if (direction === 'external') {
    return (
      <svg className="direction-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    );
  }

  return (
    <svg className="direction-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === 'right'
        ? <path d="M4 12h15M13 6l6 6-6 6" />
        : <path d="M20 12H5M11 6l-6 6 6 6" />}
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg className="close-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function StepIcon({ kind }: { kind: 'minus' | 'plus' }) {
  return (
    <svg className="step-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 12h12" />
      {kind === 'plus' && <path d="M12 6v12" />}
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6.5 12.5 3.2 3.2 7.8-8" />
    </svg>
  );
}
