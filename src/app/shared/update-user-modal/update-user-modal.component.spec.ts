import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserModalComponent } from './update-user-modal.component';

describe('UpdateUserModalComponent', () => {
  let component: UpdateUserModalComponent;
  let fixture: ComponentFixture<UpdateUserModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateUserModalComponent]
    });
    fixture = TestBed.createComponent(UpdateUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
