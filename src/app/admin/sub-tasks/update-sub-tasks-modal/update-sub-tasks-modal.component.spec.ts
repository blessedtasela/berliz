import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateSubTasksModalComponent } from './update-sub-tasks-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UpdateSubTasksModalComponent', () => {
  let component: UpdateSubTasksModalComponent;
  let fixture: ComponentFixture<UpdateSubTasksModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [UpdateSubTasksModalComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: { subTaskData: { id: 1, name: 'Test subtask' } } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(UpdateSubTasksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
