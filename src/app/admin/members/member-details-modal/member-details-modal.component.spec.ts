import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDetailsModalComponent } from './member-details-modal.component';

describe('MemberDetailsModalComponent', () => {
  let component: MemberDetailsModalComponent;
  let fixture: ComponentFixture<MemberDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberDetailsModalComponent]
    });
    fixture = TestBed.createComponent(MemberDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
