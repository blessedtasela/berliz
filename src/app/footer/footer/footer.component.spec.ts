import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { FooterComponent } from './footer.component';
import { AuthService } from 'src/app/services/auth.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const auth = { isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false) };

  beforeEach(() => {
    auth.isAuthenticated.and.returnValue(false);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: AuthService, useValue: auth }
      ]
    });
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('says before the click that feedback needs a login, and drops the note once signed in', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('(login required)');
    auth.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('(login required)');
  });

  it('lists the pricing and testimonials pages in the quick links', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pricing');
    expect(text).toContain('Testimonials');
  });
});
