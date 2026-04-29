import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRouteComponent } from './user-route.component';

describe('UserRouteComponent', () => {
  let component: UserRouteComponent;
  let fixture: ComponentFixture<UserRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserRouteComponent]
    });
    fixture = TestBed.createComponent(UserRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
