import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterEquipmentsComponent } from './center-equipments.component';

describe('CenterEquipmentsComponent', () => {
  let component: CenterEquipmentsComponent;
  let fixture: ComponentFixture<CenterEquipmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterEquipmentsComponent]
    });
    fixture = TestBed.createComponent(CenterEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
