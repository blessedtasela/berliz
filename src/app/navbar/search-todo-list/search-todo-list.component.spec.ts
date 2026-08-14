import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { SearchTodoListComponent } from './search-todo-list.component';

describe('SearchTodoListComponent', () => {
  let component: SearchTodoListComponent;
  let fixture: ComponentFixture<SearchTodoListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTodoListComponent],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SearchTodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
