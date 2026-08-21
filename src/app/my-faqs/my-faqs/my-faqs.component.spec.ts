import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MyFaqsComponent } from './my-faqs.component';

describe('MyFaqsComponent', () => {
  let component: MyFaqsComponent;
  let fixture: ComponentFixture<MyFaqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyFaqsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(MyFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
