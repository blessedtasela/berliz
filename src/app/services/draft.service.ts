import { Injectable } from '@angular/core';
import { DraftEntry } from '../models/draft.model';

const INDEX_KEY = 'berliz.draft.index';
const ENTRY_PREFIX = 'berliz.draft.entry.';

/**
 * Generic "unfinished work" persistence -- per-device (localStorage), same
 * reasoning as every other per-device preference this app keeps client-side:
 * a half-written post or an in-progress booking is exactly the kind of thing
 * a user expects to survive an accidental tab close or a wrong back-button
 * tap, without needing a server round trip just to keep typing.
 *
 * Usage from a feature (see DashboardTimelineComponent / BookingFormComponent
 * for the two wired-up examples):
 *   ngOnInit() {
 *     const existing = this.draftService.get('post');
 *     if (existing) this.pendingDraft = existing; // show the resume banner, don't auto-restore
 *   }
 *   // ...user picks "Continue" -> apply existing.data yourself, then:
 *   resumeDraft() { this.draftContent = this.pendingDraft.data.content; ...; this.pendingDraft = null; }
 *   // ...or "Start fresh":
 *   discardDraft() { this.draftService.discard('post'); this.pendingDraft = null; }
 *
 *   // On every meaningful edit:
 *   onContentChange() { this.draftService.save('post', {content: this.draftContent, ...}, {label: 'Post', route: '/dashboard/timeline'}); }
 *
 *   // Once the action actually completes:
 *   submitPost() { ... success handler ... this.draftService.discard('post'); }
 *
 * Each (type, id) pair is exactly one draft -- saving again overwrites it,
 * there's no history. `id` defaults to 'default' for flows that only ever
 * have one draft in flight (a single post composer); pass a real id (e.g.
 * a provider id) for flows where more than one could be in progress at once
 * (a booking draft per provider).
 */
@Injectable({ providedIn: 'root' })
export class DraftService {

  save<T>(
    type: string,
    data: T,
    opts: { id?: string; label: string; preview?: string; route: string; queryParams?: Record<string, any> }
  ): void {
    const id = opts.id ?? 'default';
    const entry: DraftEntry<T> = {
      type,
      id,
      label: opts.label,
      preview: opts.preview,
      route: opts.route,
      queryParams: opts.queryParams,
      savedAt: Date.now(),
      data,
    };
    try {
      localStorage.setItem(this.entryKey(type, id), JSON.stringify(entry));
      this.addToIndex(this.entryKey(type, id));
    } catch { /* degrade silently -- an unsaved draft is no worse than before this existed */ }
  }

  get<T = any>(type: string, id = 'default'): DraftEntry<T> | null {
    try {
      const raw = localStorage.getItem(this.entryKey(type, id));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  has(type: string, id = 'default'): boolean {
    return this.get(type, id) !== null;
  }

  discard(type: string, id = 'default'): void {
    const key = this.entryKey(type, id);
    try { localStorage.removeItem(key); } catch { /* degrade silently */ }
    this.removeFromIndex(key);
  }

  /** Every saved draft across every flow, newest first -- backs the My Drafts page. */
  list(): DraftEntry[] {
    const keys = this.readIndex();
    const entries: DraftEntry[] = [];
    let indexDirty = false;

    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) { indexDirty = true; continue; } // discarded (or cleared) without going through discard()
        entries.push(JSON.parse(raw));
      } catch {
        indexDirty = true; // corrupt entry -- drop it from the index rather than error on every list() call
      }
    }

    if (indexDirty) this.writeIndex(entries.map(e => this.entryKey(e.type, e.id)));

    return entries.sort((a, b) => b.savedAt - a.savedAt);
  }

  discardAll(): void {
    for (const entry of this.list()) this.discard(entry.type, entry.id);
  }

  private entryKey(type: string, id: string): string {
    return `${ENTRY_PREFIX}${type}:${id}`;
  }

  private readIndex(): string[] {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeIndex(keys: string[]): void {
    try { localStorage.setItem(INDEX_KEY, JSON.stringify([...new Set(keys)])); } catch { /* degrade silently */ }
  }

  private addToIndex(key: string): void {
    const keys = this.readIndex();
    if (!keys.includes(key)) this.writeIndex([...keys, key]);
  }

  private removeFromIndex(key: string): void {
    const keys = this.readIndex();
    if (keys.includes(key)) this.writeIndex(keys.filter(k => k !== key));
  }
}
