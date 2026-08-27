import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RouterBreadcrumbComponent } from './router-breadcrumb.component';
import { BreadcrumbManualService } from 'src/app/services/breadcrumb-manual.service';

describe('RouterBreadcrumbComponent', () => {
  let component: RouterBreadcrumbComponent;
  let fixture: ComponentFixture<RouterBreadcrumbComponent>;

  beforeEach(() => {
    const breadcrumbManualServiceSpy = jasmine.createSpyObj('BreadcrumbManualService', ['getBreadcrumbs']);
    breadcrumbManualServiceSpy.getBreadcrumbs.and.returnValue([]);

    TestBed.configureTestingModule({
      declarations: [RouterBreadcrumbComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: BreadcrumbManualService, useValue: breadcrumbManualServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(RouterBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
