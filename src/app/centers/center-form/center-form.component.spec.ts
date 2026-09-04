import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { CenterFormComponent } from './center-form.component';

describe('CenterFormComponent', () => {
  let component: CenterFormComponent;
  let fixture: ComponentFixture<CenterFormComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [CenterFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: dialogSpy },
      ]
    });
    fixture = TestBed.createComponent(CenterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: this used to be a blocking window.confirm() -- now it's the
  // app's own PromptModalComponent, opened through MatDialog instead.
  it('submitForm asks for confirmation via the custom prompt modal, not window.confirm', () => {
    component.centerForm.setValue({
      name: 'Six Chars', facebookUrl: '', instagramUrl: 'https://instagram.com/x', twitterUrl: '', motivation: ''
    });
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

    component.submitForm();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect((dialogSpy.open.calls.mostRecent().args[1] as any)?.data?.confirmation).toBeTrue();
  });
});
