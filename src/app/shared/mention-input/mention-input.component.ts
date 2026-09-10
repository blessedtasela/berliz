import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import { UserService } from 'src/app/services/user.service';

/** Matches an in-progress `@handle` right at the end of the text up to the cursor -- ^ or whitespace before it, so "email@x" mid-word never triggers suggestions. */
const MENTION_IN_PROGRESS = /(?:^|\s)@([a-zA-Z0-9_]{0,30})$/;

/**
 * A single-line text input with `@username` autocomplete. Extracted from
 * PostCommentsComponent so the root comment box, each comment's edit field,
 * and each reply box can all share one implementation (they used to hand-roll
 * the same debounce + cursor-splice logic).
 *
 * Two-way bindable via `[(value)]`. Emits `submitted` on Enter when the
 * suggestion menu is closed; Enter with the menu open picks the first
 * suggestion instead.
 */
@Component({
  selector: 'app-mention-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './mention-input.component.html',
})
export class MentionInputComponent implements OnDestroy {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() dark = false;
  @Input() placeholder = 'Write a comment… use @username to mention';

  @Output() submitted = new EventEmitter<void>();

  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;

  suggestions: PublicDirectoryEntry[] = [];
  private query$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {
    this.query$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(q => this.userService.getPublicDirectory(q, null)),
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => this.suggestions = (res.data ?? []).slice(0, 6),
      error: () => this.suggestions = [],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModel(v: string): void {
    this.value = v;
    this.valueChange.emit(v);
  }

  onInput(input: HTMLInputElement): void {
    const cursor = input.selectionStart ?? this.value.length;
    const match = MENTION_IN_PROGRESS.exec(this.value.slice(0, cursor));
    if (!match) { this.close(); return; }
    this.query$.next(match[1]);
  }

  /** Enter: pick the highlighted (first) suggestion if the menu is open, else submit. */
  onEnter(): void {
    if (this.suggestions.length > 0) {
      this.select(this.suggestions[0]);
    } else {
      this.submitted.emit();
    }
  }

  close(): void {
    this.suggestions = [];
  }

  select(user: PublicDirectoryEntry): void {
    if (!user.username) { this.close(); return; }

    const inputEl = this.inputRef?.nativeElement;
    const cursor = inputEl?.selectionStart ?? this.value.length;
    const match = MENTION_IN_PROGRESS.exec(this.value.slice(0, cursor));
    if (!match) { this.close(); return; }

    // '@' plus the partial query typed so far, immediately before the cursor.
    const atIndex = cursor - 1 - match[1].length;
    const before = this.value.slice(0, atIndex);
    const after = this.value.slice(cursor);
    const inserted = `@${user.username} `;
    this.onModel(before + inserted + after);
    this.close();

    setTimeout(() => {
      if (!inputEl) return;
      inputEl.focus();
      const pos = (before + inserted).length;
      inputEl.setSelectionRange(pos, pos);
    });
  }

  photoSrc(entry: PublicDirectoryEntry): string | null {
    return entry.profilePhoto ? 'data:image/*;base64,' + entry.profilePhoto : null;
  }

  trackById(_: number, entry: PublicDirectoryEntry): number {
    return entry.id;
  }
}
