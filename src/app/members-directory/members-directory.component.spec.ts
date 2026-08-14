import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MembersDirectoryComponent } from './members-directory.component';
import { AuthService } from 'src/app/services/auth.service';

describe('MembersDirectoryComponent', () => {
  let component: MembersDirectoryComponent;
  let fixture: ComponentFixture<MembersDirectoryComponent>;

  beforeEach(() => {
    const mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockAuthService.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [MembersDirectoryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: AuthService, useValue: mockAuthService },
      ]
    });

    fixture = TestBed.createComponent(MembersDirectoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
