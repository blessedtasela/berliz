import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

export interface SelectOption {
  value: any;
  label: string;
}

/**
 * The app's one searchable dropdown for forms. A plain `<select>` can't be
 * searched, and on a long list (every user, every city) that makes a form
 * unusable; this wraps ng-select with the shared `.berliz-select` look and
 * three behaviours the bare control got wrong:
 *
 *  - the open list is attached to `<body>`, so a modal's overflow or the field
 *    below can never clip or hide it;
 *  - it always shows a caret and a type-to-search box (the old location pickers
 *    hid the caret, so it looked like a plain, unsearchable select);
 *  - a saved value that isn't in the loaded list (a city typed by hand, a user
 *    outside the first page) still displays instead of rendering blank.
 *
 * Works with `formControlName` / `ngModel`. Items can be primitives, or objects
 * with `bindLabel`/`bindValue`, or objects with a `labelFn` for a composed label.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
  template: `
    <ng-select class="berliz-select"
      [ngClass]="{ 'berliz-select--error': invalid, 'berliz-select--compact': compact }"
      [items]="options" bindLabel="label" bindValue="value"
      [multiple]="multiple" [placeholder]="placeholder" [clearable]="clearable"
      [searchable]="true" [closeOnSelect]="!multiple" [clearSearchOnAdd]="true"
      [addTag]="allowCustom ? addCustom : false" [addTagText]="customLabel"
      [notFoundText]="allowCustom ? 'Type to add your own' : notFoundText"
      [loading]="loading" [appendTo]="appendTo" [virtualScroll]="options.length > 150"
      [inputAttrs]="{ 'aria-label': ariaLabel || placeholder }"
      [disabled]="disabled"
      [ngModel]="model" (ngModelChange)="onModelChange($event)" [ngModelOptions]="{ standalone: true }"
      (blur)="onTouched()">
    </ng-select>
  `,
})
export class SelectComponent implements ControlValueAccessor, OnChanges {

  @Input() items: any[] | null = [];
  /** Property holding the label of an object item. Leave off for primitives. */
  @Input() bindLabel?: string;
  /** Property holding the value of an object item. Leave off to use the item itself. */
  @Input() bindValue?: string;
  /** Builds the label for an object item, e.g. `u => u.firstname + ' ' + u.lastname`. Wins over bindLabel. */
  @Input() labelFn?: (item: any) => string;
  @Input() placeholder = 'Select...';
  @Input() ariaLabel?: string;
  @Input() multiple = false;
  @Input() clearable = true;
  /** Let the person type a value that isn't in the list. */
  @Input() allowCustom = false;
  @Input() customLabel = 'Use: ';
  @Input() notFoundText = 'No matches';
  @Input() loading = false;
  @Input() invalid = false;
  /** Tighter height and text, for rows that repeat down a form. */
  @Input() compact = false;
  /** Where the open list is attached. `body` keeps it out of modals' clipping. */
  @Input() appendTo = 'body';

  options: SelectOption[] = [];
  model: any = null;
  disabled = false;

  private onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  addCustom = (term: string): SelectOption => ({ value: term, label: term });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['bindLabel'] || changes['bindValue'] || changes['labelFn']) {
      this.options = (this.items ?? []).map(item => this.toOption(item));
      this.keepSelectedVisible();
    }
  }

  writeValue(value: any): void {
    this.model = value ?? (this.multiple ? [] : null);
    this.keepSelectedVisible();
  }

  registerOnChange(fn: (value: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onModelChange(value: any): void {
    this.model = value;
    this.keepSelectedVisible();
    this.onChange(value);
  }

  private toOption(item: any): SelectOption {
    if (item !== null && typeof item === 'object') {
      const label = this.labelFn ? this.labelFn(item) : String(item[this.bindLabel ?? 'name'] ?? '');
      return { label, value: this.bindValue ? item[this.bindValue] : item };
    }
    return { label: String(item), value: item };
  }

  /** A selected value missing from the list (saved earlier, or typed in) still has to show its label. */
  private keepSelectedVisible(): void {
    const selected = Array.isArray(this.model) ? this.model : (this.model === null || this.model === undefined || this.model === '' ? [] : [this.model]);
    const missing = selected.filter(v => typeof v !== 'object' && !this.options.some(o => o.value === v));
    if (missing.length) {
      this.options = [...this.options, ...missing.map(v => ({ value: v, label: String(v) }))];
    }
  }
}
