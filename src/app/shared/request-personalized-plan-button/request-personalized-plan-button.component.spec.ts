import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RequestPersonalizedPlanButtonComponent } from './request-personalized-plan-button.component';

describe('RequestPersonalizedPlanButtonComponent', () => {
  let fixture: ComponentFixture<RequestPersonalizedPlanButtonComponent>;
  let component: RequestPersonalizedPlanButtonComponent;
  let service: jasmine.SpyObj<PersonalizedRequestService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement | null;

  beforeEach(() => {
    service = jasmine.createSpyObj('PersonalizedRequestService', ['submit']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      imports: [RequestPersonalizedPlanButtonComponent],
      providers: [
        { provide: PersonalizedRequestService, useValue: service },
        { provide: SnackBarService, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    })
      // Imports MatDialogModule for its own template, which re-provides a real MatDialog at the
      // component's injector level and shadows the override above unless stripped -- same fix
      // dashboard-timeline.component.spec.ts uses.
      .overrideComponent(RequestPersonalizedPlanButtonComponent, { set: { imports: [CommonModule, IconsModule], schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(RequestPersonalizedPlanButtonComponent);
    component = fixture.componentInstance;
  });

  it('shows nothing for a center, or when no trainerId is known', () => {
    component.role = 'center';
    component.trainerId = 9;
    fixture.detectChanges();
    expect(q('button')).toBeNull();

    component.role = 'trainer';
    component.trainerId = null;
    fixture.detectChanges();
    expect(q('button')).toBeNull();
  });

  it('shows the button for a trainer with a known id', () => {
    component.role = 'trainer';
    component.trainerId = 9;
    fixture.detectChanges();
    expect(q('button')).not.toBeNull();
  });

  it('opens the dialog and submits the request on close', () => {
    dialog.open.and.returnValue({
      afterClosed: () => of({ description: 'A 3-session plan', proposedSessions: 3, proposedAmount: 200 }),
    } as any);
    service.submit.and.returnValue(of({ data: { message: 'Your request has been sent' } } as any));
    component.role = 'trainer';
    component.trainerId = 9;
    component.trainerName = 'Coach Jane';
    fixture.detectChanges();

    (q('button') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalled();
    expect(service.submit).toHaveBeenCalledWith(9, 'A 3-session plan', 3, 200);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Your request has been sent', '');
    expect(component.busy).toBeFalse();
  });

  it('does nothing when the dialog is dismissed', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as any);
    component.role = 'trainer';
    component.trainerId = 9;
    fixture.detectChanges();

    (q('button') as HTMLButtonElement).click();

    expect(service.submit).not.toHaveBeenCalled();
  });

  it('shows the server error when the submit fails', () => {
    dialog.open.and.returnValue({
      afterClosed: () => of({ description: 'A 3-session plan', proposedSessions: null, proposedAmount: 200 }),
    } as any);
    service.submit.and.returnValue(throwError(() => ({ error: { message: 'Add your name and a profile photo before sending a request.' } })));
    component.role = 'trainer';
    component.trainerId = 9;
    fixture.detectChanges();

    (q('button') as HTMLButtonElement).click();

    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Add your name and a profile photo before sending a request.', 'error');
    expect(component.busy).toBeFalse();
  });
});
