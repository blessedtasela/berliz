import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TrainersDetailsHeroComponent } from './trainers-details-hero.component';

describe('TrainersDetailsHeroComponent', () => {
  let component: TrainersDetailsHeroComponent;
  let fixture: ComponentFixture<TrainersDetailsHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersDetailsHeroComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(TrainersDetailsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
