import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterDetailPageComponent } from './center-detail-page.component';
import { selectCenters } from 'src/app/state/center/center.selectors';

describe('CenterDetailPageComponent', () => {
  let component: CenterDetailPageComponent;
  let fixture: ComponentFixture<CenterDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectCenters, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(CenterDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
