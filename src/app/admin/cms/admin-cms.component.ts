import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { AdminCmsService, CmsColumn, CmsEntity } from 'src/app/services/admin-cms.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

type Row = Record<string, any>;

const NUMERIC = new Set(['Integer', 'int', 'Long', 'long', 'Double', 'double', 'Float', 'float', 'Short', 'short', 'BigDecimal']);
const BOOLEAN = new Set(['Boolean', 'boolean']);
const DATE_LIKE = new Set(['Date', 'Timestamp', 'Instant', 'LocalDateTime', 'LocalDate']);

/**
 * Records manager: browse, search, edit and delete the rows of every record type (bookings, posts, workouts, payouts,
 * promotions, reviews, ...) in one place, for the admin. Mirrors the backend's generic `/admin/cms`. Accounts are
 * managed on their own Users screen, which has the super-admin rules.
 */
@Component({
  selector: 'app-admin-cms',
  imports: [CommonModule, FormsModule, IconsModule, LoadErrorComponent],
  templateUrl: './admin-cms.component.html',
})
export class AdminCmsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  entities: CmsEntity[] = [];
  entityFilter = '';
  selected: CmsEntity | null = null;

  rows: Row[] = [];
  columns: CmsColumn[] = [];
  total = 0;
  page = 0;
  readonly size = 25;
  query = '';

  loadingEntities = true;
  loading = false;
  loadError: string | null = null;

  /** The row being edited, the values in the form, and whether a save is in flight. */
  editing: Row | null = null;
  form: Row = {};
  saving = false;
  formError: string | null = null;

  private search$ = new Subject<string>();

  constructor(
    private cms: AdminCmsService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadEntities();
    this.search$.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { this.page = 0; this.loadRows(); });
  }

  // ---- record types ----

  loadEntities(): void {
    this.loadingEntities = true;
    this.loadError = null;
    this.cms.entities().subscribe({
      next: res => { this.entities = res.data ?? []; this.loadingEntities = false; },
      error: err => { this.loadingEntities = false; this.loadError = err?.error?.message || "Couldn't load the record types."; },
    });
  }

  get filteredEntities(): CmsEntity[] {
    const f = this.entityFilter.trim().toLowerCase();
    return f ? this.entities.filter(e => e.label.toLowerCase().includes(f)) : this.entities;
  }

  select(entity: CmsEntity): void {
    this.selected = entity;
    this.query = '';
    this.page = 0;
    this.closeEditor();
    this.loadRows();
  }

  // ---- rows ----

  loadRows(): void {
    if (!this.selected) return;
    this.loading = true;
    this.loadError = null;
    this.cms.list(this.selected.key, this.page, this.size, this.query).subscribe({
      next: res => {
        this.rows = res.data.items;
        this.total = res.data.total;
        this.columns = res.data.columns;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.loadError = err?.error?.message || "Couldn't load these records.";
      },
    });
  }

  onSearch(value: string): void {
    this.query = value;
    this.search$.next(value);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.size));
  }

  prev(): void { if (this.page > 0) { this.page--; this.loadRows(); } }
  next(): void { if (this.page + 1 < this.pageCount) { this.page++; this.loadRows(); } }

  /** The first handful of columns -- enough to recognise a row; the editor shows the rest. */
  get tableColumns(): CmsColumn[] {
    return this.columns.slice(0, 7);
  }

  cell(row: Row, col: CmsColumn): string {
    const v = row[col.name];
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    const text = String(v);
    return text.length > 60 ? text.slice(0, 57) + '…' : text;
  }

  // ---- editing ----

  open(row: Row): void {
    this.editing = row;
    this.formError = null;
    this.form = {};
    for (const c of this.columns) if (c.editable) this.form[c.name] = row[c.name] ?? '';
  }

  closeEditor(): void {
    this.editing = null;
    this.form = {};
    this.formError = null;
  }

  isBoolean(c: CmsColumn): boolean { return BOOLEAN.has(c.type); }
  isNumber(c: CmsColumn): boolean { return NUMERIC.has(c.type); }
  isDate(c: CmsColumn): boolean { return DATE_LIKE.has(c.type); }
  isLongText(c: CmsColumn): boolean { return c.type === 'String' && String(this.editing?.[c.name] ?? '').length > 80; }

  get editableColumns(): CmsColumn[] { return this.columns.filter(c => c.editable); }
  get readOnlyColumns(): CmsColumn[] { return this.columns.filter(c => !c.editable); }

  /** Only what the admin actually changed -- so saving never rewrites untouched fields. */
  changedFields(): Row {
    const out: Row = {};
    if (!this.editing) return out;
    for (const c of this.editableColumns) {
      const before = this.editing[c.name] ?? '';
      const after = this.form[c.name] ?? '';
      if (String(before) !== String(after)) out[c.name] = this.form[c.name];
    }
    return out;
  }

  get hasChanges(): boolean { return Object.keys(this.changedFields()).length > 0; }

  save(): void {
    if (!this.selected || !this.editing || this.saving) return;
    const changes = this.changedFields();
    if (Object.keys(changes).length === 0) return;
    this.saving = true;
    this.formError = null;
    const id = this.editing['id'];
    this.cms.update(this.selected.key, id, changes).subscribe({
      next: res => {
        this.saving = false;
        const i = this.rows.findIndex(r => r['id'] === id);
        if (i >= 0) this.rows[i] = res.data;
        this.editing = res.data;
        this.open(res.data);
        this.snackBar.openSnackBar('Saved', '');
      },
      error: err => {
        this.saving = false;
        this.formError = err?.error?.message || 'That could not be saved.';
      },
    });
  }

  remove(row: Row): void {
    if (!this.selected) return;
    const entity = this.selected;
    const config = new MatDialogConfig();
    config.data = {
      message: `Delete ${entity.label.toLowerCase()} #${row['id']}? This cannot be undone.`,
      confirmation: true,
      disableClose: true,
    };
    this.dialog.open(PromptModalComponent, config).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.cms.delete(entity.key, row['id']).subscribe({
        next: res => {
          this.snackBar.openSnackBar(res?.message || 'Deleted', '');
          if (this.editing?.['id'] === row['id']) this.closeEditor();
          this.loadRows();
        },
        error: err => this.snackBar.openSnackBar(err?.error?.message || "That couldn't be deleted.", 'error'),
      });
    });
  }

  trackRow(_: number, row: Row): unknown { return row['id']; }
}
