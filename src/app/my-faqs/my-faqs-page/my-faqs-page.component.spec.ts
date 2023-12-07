import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFaqsPageComponent } from './my-faqs-page.component';

describe('MyFaqsPageComponent', () => {
  let component: MyFaqsPageComponent;
  let fixture: ComponentFixture<MyFaqsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyFaqsPageComponent]
    });
    fixture = TestBed.createComponent(MyFaqsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
