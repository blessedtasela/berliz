import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { NewsletterDetailPageComponent } from './newsletter-detail-page.component';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';

describe('NewsletterDetailPageComponent', () => {
  let component: NewsletterDetailPageComponent;
  let fixture: ComponentFixture<NewsletterDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectNewsletters, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(NewsletterDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
