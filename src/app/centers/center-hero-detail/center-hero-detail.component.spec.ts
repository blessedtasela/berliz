import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterHeroDetailComponent } from './center-hero-detail.component';

describe('CenterHeroDetailComponent', () => {
  let component: CenterHeroDetailComponent;
  let fixture: ComponentFixture<CenterHeroDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterHeroDetailComponent]
    });
    fixture = TestBed.createComponent(CenterHeroDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
