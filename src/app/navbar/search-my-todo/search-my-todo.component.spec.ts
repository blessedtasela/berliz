import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { SearchMyTodoComponent } from './search-my-todo.component';

describe('SearchMyTodoComponent', () => {
  let component: SearchMyTodoComponent;
  let fixture: ComponentFixture<SearchMyTodoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMyTodoComponent],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SearchMyTodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
