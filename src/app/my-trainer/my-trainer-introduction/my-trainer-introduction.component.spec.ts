import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerIntroductionComponent } from './my-trainer-introduction.component';

describe('MyTrainerIntroductionComponent', () => {
  let component: MyTrainerIntroductionComponent;
  let fixture: ComponentFixture<MyTrainerIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerIntroductionComponent]
    });
    fixture = TestBed.createComponent(MyTrainerIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
