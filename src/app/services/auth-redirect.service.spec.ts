import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthRedirectService } from './auth-redirect.service';

describe('AuthRedirectService', () => {
  let service: AuthRedirectService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/trainers/allen-fits' });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
      ]
    });

    service = TestBed.inject(AuthRedirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigates to /login carrying the current URL as returnUrl', () => {
    service.goToLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/trainers/allen-fits' }
    });
  });

  it('also carries an action flag when one is given', () => {
    service.goToLogin('book');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/trainers/allen-fits', action: 'book' }
    });
  });

  it('does not attach a returnUrl when already on /login', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/login' });

    service.goToLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: {} });
  });
});
