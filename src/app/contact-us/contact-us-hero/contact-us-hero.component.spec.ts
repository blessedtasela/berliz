import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsHeroComponent } from './contact-us-hero.component';

describe('ContactUsHeroComponent', () => {
  let component: ContactUsHeroComponent;
  let fixture: ComponentFixture<ContactUsHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsHeroComponent]
    });
    fixture = TestBed.createComponent(ContactUsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
