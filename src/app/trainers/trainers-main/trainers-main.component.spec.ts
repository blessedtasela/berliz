import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { TrainersMainComponent } from './trainers-main.component';

describe('TrainersMainComponent', () => {
  let component: TrainersMainComponent;
  let fixture: ComponentFixture<TrainersMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(TrainersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
