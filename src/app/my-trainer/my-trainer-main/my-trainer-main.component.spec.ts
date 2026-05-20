import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerMainComponent } from './my-trainer-main.component';

describe('MyTrainerMainComponent', () => {
  let component: MyTrainerMainComponent;
  let fixture: ComponentFixture<MyTrainerMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerMainComponent]
    });
    fixture = TestBed.createComponent(MyTrainerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
