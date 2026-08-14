import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { AdminSearchComponent } from './admin-search.component';

describe('AdminSearchComponent', () => {
  let component: AdminSearchComponent;
  let fixture: ComponentFixture<AdminSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });

    fixture = TestBed.createComponent(AdminSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
