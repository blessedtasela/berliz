import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { InlineAlertComponent } from './inline-alert.component';

describe('InlineAlertComponent', () => {
  let fixture: ComponentFixture<InlineAlertComponent>;
  let component: InlineAlertComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [InlineAlertComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InlineAlertComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing when there is no message', () => {
    component.message = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role]')).toBeNull();
  });

  it('announces errors assertively (role=alert) and shows the text', () => {
    component.message = 'Could not save';
    component.kind = 'error';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Could not save');
  });

  it('announces success politely (role=status)', () => {
    component.message = 'Saved';
    component.kind = 'success';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('emits dismissed when the close button is clicked', () => {
    component.message = 'Oops';
    fixture.detectChanges();
    let fired = false;
    component.dismissed.subscribe(() => (fired = true));
    fixture.nativeElement.querySelector('button').click();
    expect(fired).toBeTrue();
  });

  it('hides the close button when not dismissible', () => {
    component.message = 'Oops';
    component.dismissible = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  // GN-76 (Nov 21, 2026): a screen that's unconditionally dark (login/signup) needs the brand
  // palette regardless of the user's light/dark toggle, not the light-mode pink/red box.
  it('uses the brand-red palette, not the light-mode one, when [dark]="true"', () => {
    component.message = 'Could not save';
    component.kind = 'error';
    component.dark = true;
    fixture.detectChanges();
    expect(component.classes).toContain('bg-brand-red/10');
    expect(component.classes).not.toContain('bg-red-50');
  });
});
