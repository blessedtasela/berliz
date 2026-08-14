import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { SearchTestimonialComponent } from './search-testimonial.component';

describe('SearchTestimonialComponent', () => {
  let component: SearchTestimonialComponent;
  let fixture: ComponentFixture<SearchTestimonialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTestimonialComponent],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SearchTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
