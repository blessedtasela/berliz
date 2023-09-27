import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterHeroComponent } from './center-hero.component';

describe('CenterHeroComponent', () => {
  let component: CenterHeroComponent;
  let fixture: ComponentFixture<CenterHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterHeroComponent]
    });
    fixture = TestBed.createComponent(CenterHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
