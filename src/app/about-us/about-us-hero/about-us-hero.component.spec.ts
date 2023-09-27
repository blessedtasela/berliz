import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsHeroComponent } from './about-us-hero.component';

describe('AboutUsHeroComponent', () => {
  let component: AboutUsHeroComponent;
  let fixture: ComponentFixture<AboutUsHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsHeroComponent]
    });
    fixture = TestBed.createComponent(AboutUsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
