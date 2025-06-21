import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderConstructionPageComponent } from './under-construction-page.component';

describe('UnderConstructionPageComponent', () => {
  let component: UnderConstructionPageComponent;
  let fixture: ComponentFixture<UnderConstructionPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnderConstructionPageComponent]
    });
    fixture = TestBed.createComponent(UnderConstructionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
