import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { SearchTrainerComponent } from './search-trainer.component';

describe('SearchTrainerComponent', () => {
  let component: SearchTrainerComponent;
  let fixture: ComponentFixture<SearchTrainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTrainerComponent],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SearchTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
