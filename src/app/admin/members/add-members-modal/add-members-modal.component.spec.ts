import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersModalComponent } from './add-members-modal.component';

describe('AddMembersModalComponent', () => {
  let component: AddMembersModalComponent;
  let fixture: ComponentFixture<AddMembersModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMembersModalComponent]
    });
    fixture = TestBed.createComponent(AddMembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
