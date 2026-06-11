import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerSubModalComponent } from './my-trainer-sub-modal.component';

describe('MyTrainerSubModalComponent', () => {
  let component: MyTrainerSubModalComponent;
  let fixture: ComponentFixture<MyTrainerSubModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerSubModalComponent]
    });
    fixture = TestBed.createComponent(MyTrainerSubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
