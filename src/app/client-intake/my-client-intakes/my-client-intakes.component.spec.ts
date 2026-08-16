import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MyClientIntakesComponent } from './my-client-intakes.component';
import { selectMyClientIntakes } from 'src/app/state/client-intake/client-intake.selectors';

describe('MyClientIntakesComponent', () => {
  let component: MyClientIntakesComponent;
  let fixture: ComponentFixture<MyClientIntakesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyClientIntakesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectMyClientIntakes, value: [] }] }),
      ]
    });

    fixture = TestBed.createComponent(MyClientIntakesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
