import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { UserHoverCardComponent } from './user-hover-card.component';

describe('UserHoverCardComponent', () => {
  let component: UserHoverCardComponent;
  let fixture: ComponentFixture<UserHoverCardComponent>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [UserHoverCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
      ]
    });

    fixture = TestBed.createComponent(UserHoverCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
