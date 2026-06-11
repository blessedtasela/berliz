import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerLikeComponent } from './my-trainer-like.component';

describe('MyTrainerLikeComponent', () => {
  let component: MyTrainerLikeComponent;
  let fixture: ComponentFixture<MyTrainerLikeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerLikeComponent]
    });
    fixture = TestBed.createComponent(MyTrainerLikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
