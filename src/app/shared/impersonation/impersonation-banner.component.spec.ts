import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpersonationBannerComponent } from './impersonation-banner.component';
import { AuthService } from 'src/app/services/auth.service';

describe('ImpersonationBannerComponent', () => {
  let component: ImpersonationBannerComponent;
  let fixture: ComponentFixture<ImpersonationBannerComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  function setup() {
    authService = jasmine.createSpyObj('AuthService', ['isImpersonating', 'getCurrentUserEmail', 'getCurrentUserRole', 'stopImpersonation']);

    TestBed.configureTestingModule({
      imports: [ImpersonationBannerComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    });

    fixture = TestBed.createComponent(ImpersonationBannerComponent);
    component = fixture.componentInstance;
  }

  it('stays hidden with no impersonation active, without reading email/role', () => {
    setup();
    authService.isImpersonating.and.returnValue(false);

    fixture.detectChanges();

    expect(component.impersonating).toBeFalse();
    expect(authService.getCurrentUserEmail).not.toHaveBeenCalled();
  });

  it('shows the impersonated identity while active', () => {
    setup();
    authService.isImpersonating.and.returnValue(true);
    authService.getCurrentUserEmail.and.returnValue('trainer@example.com');
    authService.getCurrentUserRole.and.returnValue('trainer');

    fixture.detectChanges();

    expect(component.impersonating).toBeTrue();
    expect(component.email).toBe('trainer@example.com');
    expect(component.role).toBe('trainer');
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('trainer@example.com');
  });

  it('returnToAdmin() restores the admin session', () => {
    setup();
    authService.isImpersonating.and.returnValue(true);
    authService.getCurrentUserEmail.and.returnValue('trainer@example.com');
    authService.getCurrentUserRole.and.returnValue('trainer');
    fixture.detectChanges();
    spyOn<any>(component, 'hardNavigateTo');

    component.returnToAdmin();

    expect(authService.stopImpersonation).toHaveBeenCalled();
    expect((component as any).hardNavigateTo).toHaveBeenCalledWith('/dashboard/users');
  });
});
