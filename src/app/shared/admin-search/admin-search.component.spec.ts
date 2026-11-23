import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { fakeAsync, tick } from '@angular/core/testing';

import { AdminSearchComponent } from './admin-search.component';

describe('AdminSearchComponent', () => {
  let component: AdminSearchComponent<{ name: string }>;
  let fixture: ComponentFixture<AdminSearchComponent<{ name: string }>>;
  const data = [{ name: 'Ada' }, { name: 'Grace' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });

    fixture = TestBed.createComponent<AdminSearchComponent<{ name: string }>>(AdminSearchComponent);
    component = fixture.componentInstance;
    component.selector = () => data;
    component.fields = [{ value: 'name', label: 'Name', accessor: (item) => item.name }];
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /** GN-125: the host needs to tell "genuinely empty" apart from "query matched nothing". */
  describe('queryActive (GN-125)', () => {
    it('emits false (and the full set) up front, with no query typed', () => {
      const activeEvents: boolean[] = [];
      const resultsEvents: { name: string }[][] = [];
      component.queryActive.subscribe(v => activeEvents.push(v));
      component.results.subscribe(v => resultsEvents.push(v));

      fixture.detectChanges();

      expect(activeEvents).toEqual([false]);
      expect(resultsEvents).toEqual([data]);
    });

    it('emits true once a query is active, even when it matches nothing', fakeAsync(() => {
      fixture.detectChanges();
      const activeEvents: boolean[] = [];
      component.queryActive.subscribe(v => activeEvents.push(v));

      component.onQueryChange('nobody-matches-this');
      tick(250);

      expect(activeEvents).toEqual([true]);
    }));

    it('goes back to false on clear()', () => {
      fixture.detectChanges();
      component.query = 'ada';
      const activeEvents: boolean[] = [];
      component.queryActive.subscribe(v => activeEvents.push(v));

      component.clear();

      expect(activeEvents).toEqual([false]);
    });
  });
});
