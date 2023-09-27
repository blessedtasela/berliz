import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerDetailHeroComponent } from './trainer-detail-hero.component';

describe('TrainerDetailHeroComponent', () => {
  let component: TrainerDetailHeroComponent;
  let fixture: ComponentFixture<TrainerDetailHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerDetailHeroComponent]
    });
    fixture = TestBed.createComponent(TrainerDetailHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
