import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagModalComponent } from './add-tag-modal.component';

describe('AddTagModalComponent', () => {
  let component: AddTagModalComponent;
  let fixture: ComponentFixture<AddTagModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTagModalComponent]
    });
    fixture = TestBed.createComponent(AddTagModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
