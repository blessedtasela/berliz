import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { PartnerApplicationComponent } from './partner-application.component';

describe('PartnerApplicationComponent', () => {
  let component: PartnerApplicationComponent;
  let fixture: ComponentFixture<PartnerApplicationComponent>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PartnerApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(PartnerApplicationComponent);
    component = fixture.componentInstance;
    component.partnerData = { role: 'trainer' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('what the applicant is told', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const show = (status: string, role = 'user') => {
      component.partnerData = { role: 'trainer', status } as any;
      component.user = { role, firstname: 'Sam', lastname: 'Lee' } as any;
      fixture.detectChanges();
    };

    it('says the application is under review while it is pending', () => {
      show('false');

      expect(el().textContent).toContain('Application pending');
      expect(el().textContent).toContain('currently under review');
      expect(el().textContent).not.toContain('not approved');
    });

    it('congratulates an approved applicant', () => {
      show('true');

      expect(el().textContent).toContain('has been approved');
    });

    it('tells a rejected applicant plainly, instead of showing nothing', () => {
      show('rejected');

      expect(el().textContent).toContain('Application not approved');
      expect(el().textContent).toContain("weren't able to approve your");
      expect(el().textContent).toContain('trainer');
      expect(el().textContent).not.toContain('Application pending');
      expect(el().textContent).not.toContain('currently under review');
      expect(el().querySelector('a[href="/contact"], a[routerLink="/contact"]')).not.toBeNull();
    });
  });
});
