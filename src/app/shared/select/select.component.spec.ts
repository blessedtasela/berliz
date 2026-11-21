import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

import { SelectComponent } from './select.component';

@Component({
  standalone: false,
  template: `<app-select [formControl]="control" [items]="items" [bindLabel]="bindLabel" [bindValue]="bindValue"
    [labelFn]="labelFn" [multiple]="multiple" [allowCustom]="allowCustom" [dark]="dark"></app-select>`,
})
class HostComponent {
  control = new FormControl<any>(null);
  items: any[] = ['Toronto', 'Vancouver'];
  bindLabel?: string;
  bindValue?: string;
  labelFn?: (item: any) => string;
  multiple = false;
  allowCustom = false;
  dark = false;
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let select: SelectComponent;

  const create = (setup: (h: HostComponent) => void = () => { }) => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    setup(host);
    fixture.detectChanges();
    select = fixture.debugElement.children[0].componentInstance;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent],
      imports: [ReactiveFormsModule, SelectComponent],
    });
  });

  it('lists primitive items as they are', () => {
    create();

    expect(select.options).toEqual([{ value: 'Toronto', label: 'Toronto' }, { value: 'Vancouver', label: 'Vancouver' }]);
  });

  it('binds object items by a label and value property', () => {
    create(h => {
      h.items = [{ code: 'CA', name: 'Canada' }, { code: 'US', name: 'United States' }];
      h.bindLabel = 'name';
      h.bindValue = 'code';
    });

    expect(select.options.map(o => o.value)).toEqual(['CA', 'US']);
    expect(select.options.map(o => o.label)).toEqual(['Canada', 'United States']);
  });

  it('builds a composed label with labelFn', () => {
    create(h => {
      h.items = [{ id: 1, first: 'Ada', last: 'Lovelace' }];
      h.bindValue = 'id';
      h.labelFn = (u: any) => `${u.first} ${u.last}`;
    });

    expect(select.options[0]).toEqual({ value: 1, label: 'Ada Lovelace' });
  });

  it('still shows a saved value that is not in the loaded list', () => {
    create();

    host.control.setValue('Calgary');
    fixture.detectChanges();

    expect(select.options.some(o => o.value === 'Calgary' && o.label === 'Calgary')).toBeTrue();
  });

  it('writes the chosen value back to the form control', () => {
    create();

    select.onModelChange('Vancouver');

    expect(host.control.value).toBe('Vancouver');
  });

  it('starts a multiple select with an empty list, not null', () => {
    create(h => h.multiple = true);

    expect(select.model).toEqual([]);
  });

  it('is disabled with its control', () => {
    create();

    host.control.disable();

    expect(select.disabled).toBeTrue();
  });

  it('turns a typed term into an option when custom values are allowed', () => {
    create(h => h.allowCustom = true);

    expect(select.addCustom('Squamish')).toEqual({ value: 'Squamish', label: 'Squamish' });
  });

  // BK-54: the open list used to render invisibly (reachable only by keyboard) when this component
  // was opened from inside an Angular Material dialog -- a plain z-index, however high, is still
  // just one stacking context among several a dialog's own overlay/backdrop machinery creates, and
  // can lose that comparison. `[popover]="true"` promotes the open list into the browser's native
  // top layer instead, which always renders above a dialog regardless of z-index.
  it('promotes the open list into the browser\'s native top layer, so a dialog can never render on top of it', () => {
    create();

    const ngSelect = fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance as NgSelectComponent;
    expect(ngSelect.popover()).toBeTrue();
  });

  // GN-76 (Nov 21, 2026): a screen that's unconditionally dark (not gated by the user's light/dark
  // toggle) needs the brand-dark skin regardless of that toggle's state.
  it('renders the brand-dark skin instead of the toggle-aware one when [dark]="true"', () => {
    create(h => h.dark = true);

    const ngSelectEl = fixture.debugElement.query(By.directive(NgSelectComponent)).nativeElement as HTMLElement;
    expect(ngSelectEl.classList).toContain('brand-select');
    expect(ngSelectEl.classList).not.toContain('berliz-select');
  });
});
