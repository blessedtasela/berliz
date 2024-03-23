import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLikeComponent } from './trainer-like.component';

describe('TrainerLikeComponent', () => {
  let component: TrainerLikeComponent;
  let fixture: ComponentFixture<TrainerLikeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerLikeComponent]
    });
    fixture = TestBed.createComponent(TrainerLikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
