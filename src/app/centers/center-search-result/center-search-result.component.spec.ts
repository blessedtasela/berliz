import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterSearchResultComponent } from './center-search-result.component';
import { CenterService } from 'src/app/services/center.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('CenterSearchResultComponent', () => {
  let component: CenterSearchResultComponent;
  let fixture: ComponentFixture<CenterSearchResultComponent>;

  beforeEach(() => {
    const centerServiceSpy = jasmine.createSpyObj('CenterService', ['likeCenter']);
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(of({}));
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [CenterSearchResultComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: RxStompService, useValue: rxStompServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(CenterSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
