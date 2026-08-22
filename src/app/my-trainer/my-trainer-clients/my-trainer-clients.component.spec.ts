import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MyTrainerClientsComponent } from './my-trainer-clients.component';

describe('MyTrainerClientsComponent', () => {
  let component: MyTrainerClientsComponent;
  let fixture: ComponentFixture<MyTrainerClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerClientsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(MyTrainerClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
