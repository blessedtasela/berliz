/**
 * Scrolls to an element by id once it's actually in the DOM -- used for
 * sidebar "jump to this section" links (e.g. My Trainer/Center Profile's
 * Introduction/Pricing/Benefits sub-items) that land on a page whose content
 * only renders after an async data load. Angular's own `anchorScrolling`
 * fires once on NavigationEnd, before that content exists, so a fragment
 * link into one of these pages would otherwise silently land at the top.
 * Call this once the host component's data-ready flag flips true instead.
 */
export function scrollToFragment(fragment: string | null | undefined): void {
  if (!fragment || typeof document === 'undefined') return;
  requestAnimationFrame(() => {
    document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
