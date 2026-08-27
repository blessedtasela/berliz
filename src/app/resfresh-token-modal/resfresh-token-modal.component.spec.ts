import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ResfreshTokenModalComponent } from './resfresh-token-modal.component';
import { UserService } from 'src/app/services/user.service';

describe('ResfreshTokenModalComponent', () => {
  let component: ResfreshTokenModalComponent;
  let fixture: ComponentFixture<ResfreshTokenModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ResfreshTokenModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: UserService, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(ResfreshTokenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
