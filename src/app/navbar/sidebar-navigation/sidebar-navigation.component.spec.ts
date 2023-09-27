import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNavigationComponent } from './sidebar-navigation.component';

describe('SidebarNavigationComponent', () => {
  let component: SidebarNavigationComponent;
  let fixture: ComponentFixture<SidebarNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarNavigationComponent]
    });
    fixture = TestBed.createComponent(SidebarNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
