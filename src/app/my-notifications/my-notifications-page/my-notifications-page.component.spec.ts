import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNotificationsPageComponent } from './my-notifications-page.component';

describe('MyNotificationsPageComponent', () => {
  let component: MyNotificationsPageComponent;
  let fixture: ComponentFixture<MyNotificationsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyNotificationsPageComponent]
    });
    fixture = TestBed.createComponent(MyNotificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
