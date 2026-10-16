import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SelectComponent } from './select.component';

@Component({
  standalone: false,
  template: `<app-select [formControl]="control" [items]="items" [bindLabel]="bindLabel" [bindValue]="bindValue"
    [labelFn]="labelFn" [multiple]="multiple" [allowCustom]="allowCustom"></app-select>`,
})
class HostComponent {
  control = new FormControl<any>(null);
  items: any[] = ['Toronto', 'Vancouver'];
  bindLabel?: string;
  bindValue?: string;
  labelFn?: (item: any) => string;
  multiple = false;
  allowCustom = false;
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
});
