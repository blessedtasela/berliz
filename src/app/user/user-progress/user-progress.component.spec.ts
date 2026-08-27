import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { UserProgressComponent } from './user-progress.component';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProgressEntry } from 'src/app/models/progress-entry.model';
import { selectMyProgressEntries, selectProgressEntryError, selectProgressEntryLoading } from 'src/app/state/progress-entry/progress-entry.selectors';
import * as ProgressEntryActions from 'src/app/state/progress-entry/progress-entry.actions';

describe('UserProgressComponent', () => {
  let component: UserProgressComponent;
  let fixture: ComponentFixture<UserProgressComponent>;
  let store: MockStore;
  let strapiServiceSpy: jasmine.SpyObj<StrapiService>;

  const entries: ProgressEntry[] = [
    { id: 1, clientId: 5, weightKg: 82.5, bodyFatPercent: 18, photos: [], date: new Date(), lastUpdate: new Date() }
  ];

  beforeEach(() => {
    strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [UserProgressComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectMyProgressEntries, value: entries },
            { selector: selectProgressEntryLoading, value: false },
            { selector: selectProgressEntryError, value: null },
          ]
        }),
        { provide: StrapiService, useValue: strapiServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(UserProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads myEntries from the store on init', () => {
    fixture.detectChanges();

    expect(component.entries).toEqual(entries);
    expect(store.dispatch).toHaveBeenCalledWith(ProgressEntryActions.loadMyProgressEntries());
  });

  it('canSaveNewEntry is false with no weight, body fat, or photo', () => {
    fixture.detectChanges();
    expect(component.canSaveNewEntry).toBeFalse();
  });

  it('canSaveNewEntry is true once a weight is entered', () => {
    fixture.detectChanges();
    component.weightKg = 80;
    expect(component.canSaveNewEntry).toBeTrue();
  });

  it('saveNewEntry dispatches createProgressEntry with the form values and resets the form', () => {
    fixture.detectChanges();
    component.weightKg = 80;
    component.bodyFatPercent = 15;

    component.saveNewEntry();

    expect(store.dispatch).toHaveBeenCalled();
    const dispatched = (store.dispatch as jasmine.Spy).calls.mostRecent().args[0];
    expect(dispatched.type).toBe('[Progress Entry] Create');
    expect(dispatched.request.weightKg).toBe(80);
    expect(dispatched.request.bodyFatPercent).toBe(15);
    expect(component.weightKg).toBeNull();
  });

  it('onNewEntryFileSelected uploads to Strapi and stores the uploaded photo on the slot', () => {
    fixture.detectChanges();
    strapiServiceSpy.uploadToStrapi.and.returnValue(of([
      { id: 1, name: 'photo.jpg', url: '/uploads/photo.jpg', fullUrl: '/uploads/photo.jpg', mime: 'image/jpeg', size: 100 }
    ]));
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: '' } } as unknown as Event;

    component.onNewEntryFileSelected(event, 0);

    expect(component.newEntryPhotoSlots[0].uploaded?.photoUrl).toBe('/uploads/photo.jpg');
  });

  it('startEdit / cancelEdit toggle inline edit mode for an entry', () => {
    fixture.detectChanges();
    component.startEdit(entries[0]);
    expect(component.editingId).toBe(1);

    component.cancelEdit();
    expect(component.editingId).toBeNull();
  });

  it('deleteEntry dispatches deleteProgressEntry for the given entry', () => {
    fixture.detectChanges();
    component.deleteEntry(entries[0]);
    expect(store.dispatch).toHaveBeenCalledWith(ProgressEntryActions.deleteProgressEntry({ entryId: 1 }));
  });
});
