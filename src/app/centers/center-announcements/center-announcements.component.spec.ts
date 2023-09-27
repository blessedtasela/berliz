import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterAnnouncementsComponent } from './center-announcements.component';

describe('CenterAnnouncementsComponent', () => {
  let component: CenterAnnouncementsComponent;
  let fixture: ComponentFixture<CenterAnnouncementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterAnnouncementsComponent]
    });
    fixture = TestBed.createComponent(CenterAnnouncementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
