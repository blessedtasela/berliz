import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ContactUsDetailPageComponent } from './contact-us-detail-page.component';
import { selectContactUsList } from 'src/app/state/contact-us/contact-us.selectors';

describe('ContactUsDetailPageComponent', () => {
  let component: ContactUsDetailPageComponent;
  let fixture: ComponentFixture<ContactUsDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectContactUsList, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(ContactUsDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
