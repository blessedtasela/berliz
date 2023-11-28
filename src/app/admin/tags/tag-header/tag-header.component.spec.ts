import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagHeaderComponent } from './tag-header.component';

describe('TagHeaderComponent', () => {
  let component: TagHeaderComponent;
  let fixture: ComponentFixture<TagHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagHeaderComponent]
    });
    fixture = TestBed.createComponent(TagHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
