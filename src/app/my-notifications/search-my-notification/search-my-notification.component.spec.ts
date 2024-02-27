import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMyNotificationComponent } from './search-my-notification.component';

describe('SearchMyNotificationComponent', () => {
  let component: SearchMyNotificationComponent;
  let fixture: ComponentFixture<SearchMyNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMyNotificationComponent]
    });
    fixture = TestBed.createComponent(SearchMyNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
