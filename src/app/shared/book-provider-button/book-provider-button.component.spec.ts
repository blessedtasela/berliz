import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookProviderButtonComponent } from './book-provider-button.component';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';

describe('BookProviderButtonComponent', () => {
  let fixture: ComponentFixture<BookProviderButtonComponent>;
  let component: BookProviderButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookProviderButtonComponent],
      providers: [{ provide: BookingLauncherService, useValue: jasmine.createSpyObj('BookingLauncherService', ['startBooking']) }],
    });
    fixture = TestBed.createComponent(BookProviderButtonComponent);
    component = fixture.componentInstance;
  });

  it('renders the light subtle skin by default', () => {
    component.role = 'trainer';
    component.trainerId = 1;
    component.subtle = true;
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-red-50');
  });

  it('renders the brand-dark subtle skin when [dark]="true"', () => {
    component.role = 'trainer';
    component.trainerId = 1;
    component.subtle = true;
    component.dark = true;
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-brand-red/10');
    expect(button.className).not.toContain('bg-red-50');
  });

  it('[dark] does not change the solid (non-subtle) variant', () => {
    component.role = 'trainer';
    component.trainerId = 1;
    component.subtle = false;
    component.dark = true;
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-red-600');
  });
});
