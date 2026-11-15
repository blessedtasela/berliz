import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { AdminAvailabilityModalComponent } from './admin-availability-modal.component';
import { AvailabilityService } from 'src/app/services/availability.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AdminAvailabilityModalComponent', () => {
  let component: AdminAvailabilityModalComponent;
  let fixture: ComponentFixture<AdminAvailabilityModalComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AdminAvailabilityModalComponent>>;
  let availabilityService: jasmine.SpyObj<AvailabilityService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  function setup(): void {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    availabilityService = jasmine.createSpyObj('AvailabilityService', [
      'getProviderAvailability', 'setProviderAvailability', 'previewProviderScheduleCollisions',
    ]);
    availabilityService.getProviderAvailability.and.returnValue(of({ data: [] } as any));
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AdminAvailabilityModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { trainerId: 5, name: 'Coach Amy' } },
        { provide: AvailabilityService, useValue: availabilityService },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });

    fixture = TestBed.createComponent(AdminAvailabilityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  // BK-48: the admin modal must not silently resubmit a schedule that would drop a booking's coverage.
  it('shows a collision warning and does not save yet when the preview reports one', () => {
    setup();
    availabilityService.previewProviderScheduleCollisions.and.returnValue(of({
      data: { hasCollisions: true, affectedBookings: [{ bookingId: 1, reference: 'BK-000001', clientName: 'Jane Doe', scheduledAt: new Date(), durationMinutes: 60, status: 'confirmed', paymentStatus: 'PAID' }] }
    } as any));

    component.save();

    expect(component.collisions?.hasCollisions).toBeTrue();
    expect(availabilityService.setProviderAvailability).not.toHaveBeenCalled();
  });

  it('saves once the admin confirms past the warning', () => {
    setup();
    availabilityService.previewProviderScheduleCollisions.and.returnValue(of({ data: { hasCollisions: true, affectedBookings: [{}] } } as any));
    availabilityService.setProviderAvailability.and.returnValue(of({ success: true } as any));
    component.save();

    component.doSave();

    expect(availabilityService.setProviderAvailability).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('saves straight away when the preview reports no collisions', () => {
    setup();
    availabilityService.previewProviderScheduleCollisions.and.returnValue(of({ data: { hasCollisions: false, affectedBookings: [] } } as any));
    availabilityService.setProviderAvailability.and.returnValue(of({ success: true } as any));

    component.save();

    expect(availabilityService.setProviderAvailability).toHaveBeenCalled();
  });

  it('still saves if the collision check itself fails -- the warning is advisory, not a gate', () => {
    setup();
    availabilityService.previewProviderScheduleCollisions.and.returnValue(throwError(() => ({ error: { message: 'down' } })));
    availabilityService.setProviderAvailability.and.returnValue(of({ success: true } as any));

    component.save();

    expect(availabilityService.setProviderAvailability).toHaveBeenCalled();
  });
});
