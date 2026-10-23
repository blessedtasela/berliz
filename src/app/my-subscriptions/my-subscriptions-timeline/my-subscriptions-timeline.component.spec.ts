import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsTimelineComponent } from './my-subscriptions-timeline.component';

describe('MySubscriptionsTimelineComponent', () => {
  let component: MySubscriptionsTimelineComponent;
  let fixture: ComponentFixture<MySubscriptionsTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsTimelineComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts oldest first and hands back the same array until the input changes', () => {
    component.subscriptions = [{ id: 2, startDate: new Date('2026-02-01') }, { id: 1, startDate: new Date('2026-01-01') }] as any;
    const first = component.sorted;
    expect(first.map(s => s.id)).toEqual([1, 2]);
    expect(component.sorted).toBe(first);
    component.subscriptions = [{ id: 3, startDate: new Date('2026-03-01') }] as any;
    expect(component.sorted.map(s => s.id)).toEqual([3]);
  });
});
