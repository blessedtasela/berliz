import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';

import { MyTrainerLikeComponent } from './my-trainer-like.component';

describe('MyTrainerLikeComponent', () => {
  let component: MyTrainerLikeComponent;
  let fixture: ComponentFixture<MyTrainerLikeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerLikeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(MyTrainerLikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
