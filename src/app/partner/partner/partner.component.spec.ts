import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { PartnerComponent } from './partner.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';
import { FallbackService } from 'src/app/services/fall-back.service';

describe('PartnerComponent', () => {
  let component: PartnerComponent;
  let fixture: ComponentFixture<PartnerComponent>;

  beforeEach(() => {
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const fallbackMock = {};

    TestBed.configureTestingModule({
      declarations: [PartnerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: RxStompService, useValue: rxStompSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FallbackService, useValue: fallbackMock }
      ]
    });
    fixture = TestBed.createComponent(PartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
