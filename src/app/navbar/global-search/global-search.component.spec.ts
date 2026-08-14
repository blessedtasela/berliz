import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { GlobalSearchComponent } from './global-search.component';

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
      ]
    });

    fixture = TestBed.createComponent(GlobalSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
