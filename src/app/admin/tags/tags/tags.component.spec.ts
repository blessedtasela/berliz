import { Actions } from '@ngrx/effects';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NEVER, of, Subject } from 'rxjs';

import { loadTags, loadTagsFailure, loadTagsSuccess } from 'src/app/state/tag/tag.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { TagsComponent } from './tags.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [TagsComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore(),
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the tags cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty table', () => {
      actions$.next(loadTagsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load tags");
      expect(el().textContent).toContain('Server exploded');
      expect(/<app-[a-z-]+-(header|list)\b/.test(el().innerHTML)).toBeFalse();
    });

    it('retrying loads them again, and a success brings the table back', () => {
      actions$.next(loadTagsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadTags());

      actions$.next(loadTagsSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });

    it('shows the table (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });
  });
});
