import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PromptModalComponent } from './prompt-modal.component';

describe('PromptModalComponent', () => {
  let component: PromptModalComponent;
  let fixture: ComponentFixture<PromptModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [PromptModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Are you sure?', confirmation: true } }
      ]
    });
    fixture = TestBed.createComponent(PromptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('wording', () => {
    function withData(data: any) {
      component.details = data;
      fixture.detectChanges();
      return fixture.nativeElement.textContent as string;
    }

    it('warns that a destructive confirmation may be irreversible', () => {
      const text = withData({ confirmation: true, message: 'Delete it?' });
      expect(text).toContain('This action may be irreversible');
      expect(component.title).toBe('Are you sure?');
    });

    it('does not call a log-in prompt irreversible, and titles it plainly', () => {
      const text = withData({ confirmation: true, icon: 'log-in', title: 'Login required', message: 'Log in to continue?' });
      expect(text).not.toContain('irreversible');
      expect(component.title).toBe('Log in to continue');
    });

    it('keeps a specific title on a log-in prompt', () => {
      withData({ confirmation: true, icon: 'log-in', title: 'Log in to apply as a trainer', message: 'x' });
      expect(component.title).toBe('Log in to apply as a trainer');
    });

    it('shows an explicit subtitle instead of the warning', () => {
      const text = withData({ confirmation: true, subtitle: 'Your plan stays active until the end of the month', message: 'Cancel?' });
      expect(text).toContain('Your plan stays active');
      expect(text).not.toContain('irreversible');
    });
  });
});
