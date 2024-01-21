import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysTodoModalComponent } from './todays-todo-modal.component';

describe('TodaysTodoModalComponent', () => {
  let component: TodaysTodoModalComponent;
  let fixture: ComponentFixture<TodaysTodoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodaysTodoModalComponent]
    });
    fixture = TestBed.createComponent(TodaysTodoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
