import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFaqsComponent } from './my-faqs.component';

describe('MyFaqsComponent', () => {
  let component: MyFaqsComponent;
  let fixture: ComponentFixture<MyFaqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyFaqsComponent]
    });
    fixture = TestBed.createComponent(MyFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
