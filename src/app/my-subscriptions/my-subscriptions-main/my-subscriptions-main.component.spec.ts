import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MySubscriptionsMainComponent } from './my-subscriptions-main.component';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('MySubscriptionsMainComponent', () => {
  let component: MySubscriptionsMainComponent;
  let fixture: ComponentFixture<MySubscriptionsMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: RxStompService, useValue: jasmine.createSpyObj('RxStompService', ['activate', 'deactivate']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['isAdmin']) }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
