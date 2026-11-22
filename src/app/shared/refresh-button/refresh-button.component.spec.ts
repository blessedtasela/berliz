import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconsModule } from 'src/app/icons/icons.module';
import { RefreshButtonComponent } from './refresh-button.component';

describe('RefreshButtonComponent', () => {
  let fixture: ComponentFixture<RefreshButtonComponent>;
  let component: RefreshButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefreshButtonComponent],
      imports: [IconsModule],
    });
    fixture = TestBed.createComponent(RefreshButtonComponent);
    component = fixture.componentInstance;
  });

  it('emits refresh on click when not loading', () => {
    let emitted = false;
    component.refresh.subscribe(() => emitted = true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(emitted).toBeTrue();
  });

  it('does not emit while loading', () => {
    component.loading = true;
    let emitted = false;
    component.refresh.subscribe(() => emitted = true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(emitted).toBeFalse();
  });

  it('renders the brand-dark skin when [dark]="true"', () => {
    component.dark = true;
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-brand-card');
    expect(button.className).not.toContain('dark:bg-gray-900');
  });
});
