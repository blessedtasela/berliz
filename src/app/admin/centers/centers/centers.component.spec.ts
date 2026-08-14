import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { selectCenters } from 'src/app/state/center/center.selectors';

import { CentersComponent } from './centers.component';

describe('CentersComponent', () => {
  let component: CentersComponent;
  let fixture: ComponentFixture<CentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CentersComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectCenters, value: [] }]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
