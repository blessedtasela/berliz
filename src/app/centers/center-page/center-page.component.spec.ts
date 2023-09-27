import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPageComponent } from './center-page.component';

describe('CenterPageComponent', () => {
  let component: CenterPageComponent;
  let fixture: ComponentFixture<CenterPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPageComponent]
    });
    fixture = TestBed.createComponent(CenterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
