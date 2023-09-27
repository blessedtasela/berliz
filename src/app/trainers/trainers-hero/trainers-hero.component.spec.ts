import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersHeroComponent } from './trainers-hero.component';

describe('TrainersHeroComponent', () => {
  let component: TrainersHeroComponent;
  let fixture: ComponentFixture<TrainersHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersHeroComponent]
    });
    fixture = TestBed.createComponent(TrainersHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
