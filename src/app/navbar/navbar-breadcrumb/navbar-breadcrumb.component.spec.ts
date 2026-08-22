import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { NavbarBreadcrumbComponent } from './navbar-breadcrumb.component';
import { BreadcrumbService } from 'xng-breadcrumb';

describe('NavbarBreadcrumbComponent', () => {
  let component: NavbarBreadcrumbComponent;
  let fixture: ComponentFixture<NavbarBreadcrumbComponent>;

  beforeEach(() => {
    const breadcrumbServiceMock = { breadcrumbs$: of([]) };
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [NavbarBreadcrumbComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceMock },
        { provide: Router, useValue: routerSpy }
      ]
    });
    fixture = TestBed.createComponent(NavbarBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
