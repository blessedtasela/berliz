import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';

import { MyTrainerCentersComponent } from './my-trainer-centers.component';

describe('MyTrainerCentersComponent', () => {
  let component: MyTrainerCentersComponent;
  let fixture: ComponentFixture<MyTrainerCentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerCentersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(MyTrainerCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
