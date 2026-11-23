import { Injectable, NgZone } from '@angular/core';

/** What a registered post-video needs to expose so the coordinator can pick a winner. */
export interface ActiveVideoHandle {
  /** Distance from the top of the document — used to pick the topmost of several eligible videos. */
  top(): number;
  play(): void;
  pause(): void;
}

/**
 * Instagram/TikTok-style "only one feed video plays at a time": every `PostVideoComponent`
 * registers itself here and reports whether it's currently eligible to autoplay (in view past
 * the visibility threshold, not manually paused, no error, motion/data-saver allows it). Among
 * whichever are eligible right now, the topmost on the page wins; everyone else gets paused.
 * A single document-level visibilitychange listener here (not one per video) pauses whoever is
 * playing when the tab is hidden, and lets the normal eligibility recompute resume it when the
 * tab comes back, rather than every instance owning its own listener.
 */
@Injectable({ providedIn: 'root' })
export class ActiveVideoService {
  private readonly handles = new Map<string, ActiveVideoHandle>();
  private readonly eligible = new Set<string>();
  private currentWinner: string | null = null;
  private recomputeScheduled = false;

  constructor(private zone: NgZone) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.currentWinner) {
          this.handles.get(this.currentWinner)?.pause();
          this.currentWinner = null;
        }
      } else {
        this.scheduleRecompute();
      }
    });
  }

  register(id: string, handle: ActiveVideoHandle): void {
    this.handles.set(id, handle);
  }

  unregister(id: string): void {
    this.handles.delete(id);
    this.eligible.delete(id);
    if (this.currentWinner === id) {
      this.currentWinner = null;
    }
    this.scheduleRecompute();
  }

  setEligible(id: string, isEligible: boolean): void {
    const changed = isEligible ? !this.eligible.has(id) : this.eligible.has(id);
    if (isEligible) {
      this.eligible.add(id);
    } else {
      this.eligible.delete(id);
      if (this.currentWinner === id) {
        this.handles.get(id)?.pause();
        this.currentWinner = null;
      }
    }
    if (changed) {
      this.scheduleRecompute();
    }
  }

  /** Coalesces bursts of IntersectionObserver callbacks (several videos can cross the threshold in the same tick) into one pick. */
  private scheduleRecompute(): void {
    if (this.recomputeScheduled) {
      return;
    }
    this.recomputeScheduled = true;
    this.zone.runOutsideAngular(() => {
      queueMicrotask(() => {
        this.recomputeScheduled = false;
        this.recompute();
      });
    });
  }

  private recompute(): void {
    if (document.hidden) {
      return;
    }
    let winner: string | null = null;
    let winnerTop = Infinity;
    for (const id of this.eligible) {
      const handle = this.handles.get(id);
      if (!handle) {
        continue;
      }
      const top = handle.top();
      if (top < winnerTop) {
        winnerTop = top;
        winner = id;
      }
    }

    if (winner === this.currentWinner) {
      return;
    }
    if (this.currentWinner) {
      this.handles.get(this.currentWinner)?.pause();
    }
    this.currentWinner = winner;
    if (winner) {
      this.handles.get(winner)?.play();
    }
  }
}
