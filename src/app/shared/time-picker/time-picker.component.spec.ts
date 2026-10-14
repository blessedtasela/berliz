import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TimePickerComponent] });
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
  });

  // Regression: the picker used to default to 30-minute steps, so trainers
  // booking/rescheduling for a client could only choose :00 or :30.
  it('offers every hour of the day at :00, :15, :30 and :45 by default', () => {
    fixture.detectChanges();

    expect(component.options.length).toBe(96);
    const values = component.options.map(o => o.value);
    expect(values[0]).toBe('00:00');
    expect(values[values.length - 1]).toBe('23:45');
    for (let h = 0; h < 24; h++) {
      for (const m of ['00', '15', '30', '45']) {
        expect(values).toContain(`${String(h).padStart(2, '0')}:${m}`);
      }
    }
  });

  it('labels options on a 12-hour clock with AM/PM', () => {
    fixture.detectChanges();
    const label = (value: string) => component.options.find(o => o.value === value)?.label;

    expect(label('00:00')).toBe('12:00 AM');
    expect(label('09:15')).toBe('9:15 AM');
    expect(label('12:45')).toBe('12:45 PM');
    expect(label('23:30')).toBe('11:30 PM');
  });

  it('still honours a caller-supplied step', () => {
    component.stepMinutes = 60;
    fixture.detectChanges();

    expect(component.options.length).toBe(24);
  });

  it('emits and stores the 24h value when an option is picked', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    component.timeChange.subscribe(v => emitted.push(v));
    let formValue: string | null = null;
    component.registerOnChange(v => (formValue = v));

    component.select(component.options.find(o => o.value === '14:15')!);

    expect(emitted).toEqual(['14:15']);
    expect(formValue as string | null).toBe('14:15');
    expect(component.label).toBe('2:15 PM');
  });
});
