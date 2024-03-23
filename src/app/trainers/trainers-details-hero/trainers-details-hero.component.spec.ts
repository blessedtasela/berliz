import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersDetailsHeroComponent } from './trainers-details-hero.component';

describe('TrainersDetailsHeroComponent', () => {
  let component: TrainersDetailsHeroComponent;
  let fixture: ComponentFixture<TrainersDetailsHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersDetailsHeroComponent]
    });
    fixture = TestBed.createComponent(TrainersDetailsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
