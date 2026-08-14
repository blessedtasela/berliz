import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { FaqsComponent } from './faqs.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { selectFaqs } from 'src/app/state/faq/faq.selectors';

describe('FaqsComponent', () => {
  let component: FaqsComponent;
  let fixture: ComponentFixture<FaqsComponent>;

  beforeEach(() => {
    const mockNgxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [FaqsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectFaqs, value: [] }]
        }),
        { provide: NgxUiLoaderService, useValue: mockNgxService },
        { provide: MatDialog, useValue: mockDialog },
      ]
    });

    fixture = TestBed.createComponent(FaqsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
