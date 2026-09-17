import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IconsModule } from 'src/app/icons/icons.module';

interface TimeOption {
  value: string; // "HH:mm", 24h
  label: string; // "9:30 AM"
}

/**
 * Custom-styled time picker that plugs into reactive forms via formControlName,
 * replacing native <input type="time">. Native time inputs don't support a real
 * placeholder (browsers ignore the attribute) and their fixed internal segment
 * widths overlap neighbouring fields in tight layouts -- this renders its own
 * dropdown list instead.
 */
@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './time-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ]
})
export class TimePickerComponent implements ControlValueAccessor, OnInit {

  @Input() placeholder = 'Select time';
  @Input() invalid = false;
  /** Step between options, in minutes. */
  @Input() stepMinutes = 30;
  @Output() timeChange = new EventEmitter<string>();

  options: TimeOption[] = [];

  open = false;
  value: string | null = null;
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.options = this.buildOptions();
  }

  get label(): string {
    if (!this.value) return this.placeholder;
    const match = this.options.find(o => o.value === this.value);
    return match ? match.label : this.value;
  }

  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open) {
      this.onTouched();
      // Bring the currently-selected option into view without a full page jump.
      queueMicrotask(() => this.scrollToSelected());
    }
  }

  select(option: TimeOption): void {
    this.value = option.value;
    this.onChange(this.value);
    this.timeChange.emit(this.value);
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open = false;
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private scrollToSelected(): void {
    const el = this.elementRef.nativeElement.querySelector('[data-selected="true"]');
    el?.scrollIntoView({ block: 'center' });
  }

  private buildOptions(): TimeOption[] {
    const options: TimeOption[] = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += this.stepMinutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const suffix = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      const label = `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
      options.push({ value, label });
    }
    return options;
  }
}
