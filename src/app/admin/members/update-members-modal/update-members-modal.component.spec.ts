import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMembersModalComponent } from './update-members-modal.component';

describe('UpdateMembersModalComponent', () => {
  let component: UpdateMembersModalComponent;
  let fixture: ComponentFixture<UpdateMembersModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateMembersModalComponent]
    });
    fixture = TestBed.createComponent(UpdateMembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
