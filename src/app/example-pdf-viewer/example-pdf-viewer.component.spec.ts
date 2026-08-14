import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

import { ExamplePdfViewerComponent } from './example-pdf-viewer.component';

describe('ExamplePdfViewerComponent', () => {
  let component: ExamplePdfViewerComponent;
  let fixture: ComponentFixture<ExamplePdfViewerComponent>;

  beforeEach(() => {
    const mockPdfService = jasmine.createSpyObj('NgxExtendedPdfViewerService', ['getCurrentDocumentAsBlob']);

    TestBed.configureTestingModule({
      declarations: [ExamplePdfViewerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: NgxExtendedPdfViewerService, useValue: mockPdfService },
      ]
    });

    fixture = TestBed.createComponent(ExamplePdfViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
