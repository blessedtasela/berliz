import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RefundDialogComponent } from './refund-dialog.component';

describe('RefundDialogComponent', () => {
  let component: RefundDialogComponent;
  let fixture: ComponentFixture<RefundDialogComponent>;
  let ref: jasmine.SpyObj<MatDialogRef<RefundDialogComponent>>;

  beforeEach(() => {
    ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [RefundDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { who: 'a@b.c', refundable: 15, alreadyRefunded: 10, currency: null } },
      ],
    });
    fixture = TestBed.createComponent(RefundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('says who is refunded and what has been refunded already', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('a@b.c');
    expect(text).toContain('$15.00');
    expect(text).toContain('$10.00');
    expect(text).toContain('already refunded');
  });

  it('refunds everything left by default', () => {
    component.confirm();
    expect(ref.close).toHaveBeenCalledWith(null);
  });

  it('refunds the part that was typed', () => {
    component.mode = 'part';
    component.amount = 4.5;
    component.confirm();
    expect(ref.close).toHaveBeenCalledWith(4.5);
  });

  it('treats a "part" equal to everything left as a full refund', () => {
    component.mode = 'part';
    component.amount = 15;
    component.confirm();
    expect(ref.close).toHaveBeenCalledWith(null);
  });

  it('refuses nothing, zero, negative or more than what is left, and says why', () => {
    component.mode = 'part';
    for (const bad of [null, 0, -3, 15.01, NaN]) {
      component.amount = bad as any;
      component.error = null;
      component.confirm();
      expect(component.error).toContain('between 0.01 and 15.00');
    }
    expect(ref.close).not.toHaveBeenCalled();
  });

  it('closes with undefined when cancelled', () => {
    const cancel = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.trim() === 'Cancel')!;
    cancel.click();
    expect(ref.close).toHaveBeenCalledWith(undefined);
  });
});
