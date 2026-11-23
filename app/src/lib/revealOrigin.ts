// The element a particle reveal should fly out of (and return to): the card the player tapped.

let origin: HTMLElement | null = null;

export function setRevealOrigin(element: HTMLElement | null): void {
  origin = element;
}

/** Current on-screen box of the remembered element, or null when it is gone or has no size. */
export function revealOriginRect(): DOMRect | null {
  if (!origin || !origin.isConnected) return null;
  const rect = origin.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}
