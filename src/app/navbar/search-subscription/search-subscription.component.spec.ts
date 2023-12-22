import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSubscriptionComponent } from './search-subscription.component';

describe('SearchSubscriptionComponent', () => {
  let component: SearchSubscriptionComponent;
  let fixture: ComponentFixture<SearchSubscriptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchSubscriptionComponent]
    });
    fixture = TestBed.createComponent(SearchSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
