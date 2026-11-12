import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CounterOfferDialogComponent } from './counter-offer-dialog.component';

describe('CounterOfferDialogComponent', () => {
  let fixture: ComponentFixture<CounterOfferDialogComponent>;
  let component: CounterOfferDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<CounterOfferDialogComponent>>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [CounterOfferDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { clientName: 'Rish Client', proposedAmount: 200 } },
      ],
    });
    fixture = TestBed.createComponent(CounterOfferDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows what the client offered', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('CA$200.00');
  });

  it('closes with undefined on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('refuses to submit with no amount', () => {
    component.counterAmount = null;
    component.submit();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.error).toContain('countering');
  });

  it('closes with the amount and the trimmed note', () => {
    component.counterAmount = 250;
    component.note = '  Needs one more session  ';
    component.submit();
    expect(dialogRef.close).toHaveBeenCalledWith({ counterAmount: 250, note: 'Needs one more session' });
  });
});
