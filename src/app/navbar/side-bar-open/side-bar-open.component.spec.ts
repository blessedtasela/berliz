import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarOpenComponent } from './side-bar-open.component';

describe('SideBarOpenComponent', () => {
  let component: SideBarOpenComponent;
  let fixture: ComponentFixture<SideBarOpenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SideBarOpenComponent]
    });
    fixture = TestBed.createComponent(SideBarOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
