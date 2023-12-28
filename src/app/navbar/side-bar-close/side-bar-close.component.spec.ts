import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarCloseComponent } from './side-bar-close.component';

describe('SideBarCloseComponent', () => {
  let component: SideBarCloseComponent;
  let fixture: ComponentFixture<SideBarCloseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SideBarCloseComponent]
    });
    fixture = TestBed.createComponent(SideBarCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
