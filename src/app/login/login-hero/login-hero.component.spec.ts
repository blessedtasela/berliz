import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHeroComponent } from './login-hero.component';

describe('LoginHeroComponent', () => {
  let component: LoginHeroComponent;
  let fixture: ComponentFixture<LoginHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginHeroComponent]
    });
    fixture = TestBed.createComponent(LoginHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
