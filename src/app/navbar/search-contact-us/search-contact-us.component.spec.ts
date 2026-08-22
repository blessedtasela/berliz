import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { SearchContactUsComponent } from './search-contact-us.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('SearchContactUsComponent', () => {
  let component: SearchContactUsComponent;
  let fixture: ComponentFixture<SearchContactUsComponent>;

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [SearchContactUsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(SearchContactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
