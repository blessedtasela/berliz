import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MySubscriptionsActionComponent } from './my-subscriptions-action.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

describe('MySubscriptionsActionComponent', () => {
  let component: MySubscriptionsActionComponent;
  let fixture: ComponentFixture<MySubscriptionsActionComponent>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['deleteSubscription']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [MySubscriptionsActionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: NgxUiLoaderService, useValue: loaderSpy }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionsActionComponent);
    component = fixture.componentInstance;
    component.subscription = { id: 1 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---- billed by Stripe vs. billed by the App Store / Google Play ----

  function menuLabels(): string[] {
    component.open = true;
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('button, a') as NodeListOf<HTMLElement>)
      .map(el => (el.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  it('a Stripe-billed subscription offers Renew and Cancel auto-renew, and no store link', () => {
    component.subscription = { id: 1, autoRenew: true } as any;
    const labels = menuLabels();

    expect(labels).toContain('Renew');
    expect(labels).toContain('Cancel auto-renew');
    expect(fixture.nativeElement.querySelector('[data-testid="manage-in-store"]')).toBeNull();
  });

  it('a Stripe-billed subscription that will not renew offers Resume instead', () => {
    component.subscription = { id: 1, autoRenew: false } as any;
    const labels = menuLabels();

    expect(labels).toContain('Resume auto-renew');
    expect(labels).not.toContain('Cancel auto-renew');
  });

  it('an App Store subscription links to Apple, and drops Renew / Cancel / Resume that would not work', () => {
    component.subscription = { id: 1, store: 'app_store', mode: 'APP_STORE', autoRenew: true } as any;
    const labels = menuLabels();

    expect(labels).toContain('Manage in App Store');
    expect(labels).not.toContain('Renew');
    expect(labels).not.toContain('Cancel auto-renew');
    expect(labels).not.toContain('Resume auto-renew');

    const link = fixture.nativeElement.querySelector('[data-testid="manage-in-store"]') as HTMLAnchorElement;
    expect(link.href).toContain('apps.apple.com');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(fixture.nativeElement.querySelector('[data-testid="billed-by-store"]').textContent)
      .toContain('Billed by the App Store');
  });

  it('a Google Play subscription links to Google Play', () => {
    component.subscription = { id: 1, mode: 'PLAY_STORE', autoRenew: false } as any;
    const labels = menuLabels();

    expect(labels).toContain('Manage in Google Play');
    expect(labels).not.toContain('Resume auto-renew');
    expect((fixture.nativeElement.querySelector('[data-testid="manage-in-store"]') as HTMLAnchorElement).href)
      .toContain('play.google.com');
  });

  it('still lets the member view details of a store-billed subscription', () => {
    component.subscription = { id: 1, store: 'app_store' } as any;
    expect(menuLabels()).toContain('View details');
  });
});
