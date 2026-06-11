import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerTestimonialsComponent } from './my-trainer-testimonials.component';

describe('MyTrainerTestimonialsComponent', () => {
  let component: MyTrainerTestimonialsComponent;
  let fixture: ComponentFixture<MyTrainerTestimonialsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerTestimonialsComponent]
    });
    fixture = TestBed.createComponent(MyTrainerTestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
