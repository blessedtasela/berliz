import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { LoginHeroComponent } from './login-hero.component';

describe('LoginHeroComponent', () => {
  let component: LoginHeroComponent;
  let fixture: ComponentFixture<LoginHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginHeroComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(LoginHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('welcomes a returning member back, on the login page', () => {
    expect(fixture.nativeElement.textContent).toContain('Welcome back');
  });

  it('greets someone creating an account instead of saying "Welcome back"', () => {
    component.mode = 'signup';
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Join Berliz');
    expect(text).not.toContain('Welcome back');
  });
});
