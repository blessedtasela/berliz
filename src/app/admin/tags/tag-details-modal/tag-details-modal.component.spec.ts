import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDetailsModalComponent } from './tag-details-modal.component';

describe('TagDetailsModalComponent', () => {
  let component: TagDetailsModalComponent;
  let fixture: ComponentFixture<TagDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TagDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
