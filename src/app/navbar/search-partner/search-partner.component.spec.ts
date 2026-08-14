import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { SearchPartnerComponent } from './search-partner.component';

describe('SearchPartnerComponent', () => {
  let component: SearchPartnerComponent;
  let fixture: ComponentFixture<SearchPartnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchPartnerComponent],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SearchPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
