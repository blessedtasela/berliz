import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';

import { CenterLikeComponent } from './center-like.component';

describe('CenterLikeComponent', () => {
  let component: CenterLikeComponent;
  let fixture: ComponentFixture<CenterLikeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterLikeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
      ]
    });

    fixture = TestBed.createComponent(CenterLikeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
