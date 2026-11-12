import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RequestPersonalizedPlanDialogComponent } from './request-personalized-plan-dialog.component';

describe('RequestPersonalizedPlanDialogComponent', () => {
  let fixture: ComponentFixture<RequestPersonalizedPlanDialogComponent>;
  let component: RequestPersonalizedPlanDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RequestPersonalizedPlanDialogComponent>>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [RequestPersonalizedPlanDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { trainerName: 'Coach Jane' } },
      ],
    });
    fixture = TestBed.createComponent(RequestPersonalizedPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('closes with undefined on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('refuses to submit with no description', () => {
    component.description = '';
    component.proposedAmount = 200;
    component.submit();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.error).toContain('Describe');
  });

  it('refuses to submit with no amount', () => {
    component.description = 'A 3-session plan';
    component.proposedAmount = null;
    component.submit();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.error).toContain('how much');
  });

  it('closes with the trimmed description and the figures entered', () => {
    component.description = '  A 3-session plan  ';
    component.proposedSessions = 3;
    component.proposedAmount = 200;
    component.submit();
    expect(dialogRef.close).toHaveBeenCalledWith({ description: 'A 3-session plan', proposedSessions: 3, proposedAmount: 200 });
  });
});
