import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterDataComponent } from './center-data.component';

describe('CenterDataComponent', () => {
  let component: CenterDataComponent;
  let fixture: ComponentFixture<CenterDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterDataComponent]
    });
    fixture = TestBed.createComponent(CenterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
