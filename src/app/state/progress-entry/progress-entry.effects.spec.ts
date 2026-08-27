import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { ProgressEntryEffects } from './progress-entry.effects';
import { ProgressEntryService } from '../../services/progress-entry.service';
import * as A from './progress-entry.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ProgressEntry } from '../../models/progress-entry.model';

describe('ProgressEntryEffects', () => {
  let actions$: Observable<any>;
  let effects: ProgressEntryEffects;
  let serviceSpy: jasmine.SpyObj<ProgressEntryService>;

  const sampleEntry: ProgressEntry = {
    id: 1, clientId: 5, weightKg: 82.5, bodyFatPercent: 18, photos: [],
    date: new Date(), lastUpdate: new Date(),
  };

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('ProgressEntryService', [
      'create', 'update', 'delete', 'addPhoto', 'removePhoto', 'getMyEntries', 'getClientEntries'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProgressEntryEffects,
        provideMockActions(() => actions$),
        { provide: ProgressEntryService, useValue: serviceSpy }
      ]
    });

    effects = TestBed.inject(ProgressEntryEffects);
  });

  it('createProgressEntry$ dispatches createProgressEntrySuccess with the entry returned by the service', async () => {
    const response: ApiResponse<ProgressEntry> = { message: 'Progress entry saved', data: sampleEntry, success: true, statusCode: 200 };
    serviceSpy.create.and.returnValue(of(response));
    actions$ = of(A.createProgressEntry({ request: { weightKg: 82.5 } }));

    const result = await firstValueFrom(effects.createProgressEntry$);

    expect(result).toEqual(A.createProgressEntrySuccess({ response }));
    expect(serviceSpy.create).toHaveBeenCalledWith({ weightKg: 82.5 });
  });

  it('createProgressEntry$ dispatches createProgressEntryFailure on error', async () => {
    serviceSpy.create.and.returnValue(throwError(() => ({ error: { message: 'Log at least a weight, body fat %, or photo.' } })));
    actions$ = of(A.createProgressEntry({ request: {} }));

    const result = await firstValueFrom(effects.createProgressEntry$);

    expect(result).toEqual(A.createProgressEntryFailure({ error: 'Log at least a weight, body fat %, or photo.' }));
  });

  it('updateProgressEntry$ dispatches updateProgressEntrySuccess with the entry returned by the service', async () => {
    const response: ApiResponse<ProgressEntry> = { message: 'Progress entry updated', data: sampleEntry, success: true, statusCode: 200 };
    serviceSpy.update.and.returnValue(of(response));
    actions$ = of(A.updateProgressEntry({ entryId: 1, request: { weightKg: 80 } }));

    const result = await firstValueFrom(effects.updateProgressEntry$);

    expect(result).toEqual(A.updateProgressEntrySuccess({ response }));
    expect(serviceSpy.update).toHaveBeenCalledWith(1, { weightKg: 80 });
  });

  it('deleteProgressEntry$ dispatches deleteProgressEntrySuccess carrying the entryId for reducer bookkeeping', async () => {
    const response: ApiResponse<ProgressEntry> = { message: 'Progress entry deleted', data: sampleEntry, success: true, statusCode: 200 };
    serviceSpy.delete.and.returnValue(of(response));
    actions$ = of(A.deleteProgressEntry({ entryId: 1 }));

    const result = await firstValueFrom(effects.deleteProgressEntry$);

    expect(result).toEqual(A.deleteProgressEntrySuccess({ response, entryId: 1 }));
  });

  it('addProgressEntryPhoto$ dispatches addProgressEntryPhotoSuccess with the entry returned by the service', async () => {
    const response: ApiResponse<ProgressEntry> = { message: 'Photo added', data: sampleEntry, success: true, statusCode: 200 };
    serviceSpy.addPhoto.and.returnValue(of(response));
    const photo = { strapiId: 1, photoUrl: '/x.jpg', name: 'x.jpg', mimeType: 'image/jpeg', byteSize: 100 };
    actions$ = of(A.addProgressEntryPhoto({ entryId: 1, photo }));

    const result = await firstValueFrom(effects.addProgressEntryPhoto$);

    expect(result).toEqual(A.addProgressEntryPhotoSuccess({ response }));
    expect(serviceSpy.addPhoto).toHaveBeenCalledWith(1, photo);
  });

  it('removeProgressEntryPhoto$ dispatches removeProgressEntryPhotoSuccess with the entry returned by the service', async () => {
    const response: ApiResponse<ProgressEntry> = { message: 'Photo removed', data: sampleEntry, success: true, statusCode: 200 };
    serviceSpy.removePhoto.and.returnValue(of(response));
    actions$ = of(A.removeProgressEntryPhoto({ entryId: 1, photoId: 3 }));

    const result = await firstValueFrom(effects.removeProgressEntryPhoto$);

    expect(result).toEqual(A.removeProgressEntryPhotoSuccess({ response }));
    expect(serviceSpy.removePhoto).toHaveBeenCalledWith(1, 3);
  });

  it('loadMyProgressEntries$ dispatches loadMyProgressEntriesSuccess with the entries returned by the service', async () => {
    const response: ApiResponse<ProgressEntry[]> = { message: 'ok', data: [sampleEntry], success: true, statusCode: 200 };
    serviceSpy.getMyEntries.and.returnValue(of(response));
    actions$ = of(A.loadMyProgressEntries());

    const result = await firstValueFrom(effects.loadMyProgressEntries$);

    expect(result).toEqual(A.loadMyProgressEntriesSuccess({ response }));
  });

  it('loadClientProgressEntries$ dispatches loadClientProgressEntriesSuccess with the entries returned by the service', async () => {
    const response: ApiResponse<ProgressEntry[]> = { message: 'ok', data: [sampleEntry], success: true, statusCode: 200 };
    serviceSpy.getClientEntries.and.returnValue(of(response));
    actions$ = of(A.loadClientProgressEntries({ clientId: 5 }));

    const result = await firstValueFrom(effects.loadClientProgressEntries$);

    expect(result).toEqual(A.loadClientProgressEntriesSuccess({ response }));
    expect(serviceSpy.getClientEntries).toHaveBeenCalledWith(5);
  });

  it('loadClientProgressEntries$ dispatches loadClientProgressEntriesFailure with the 403 access-denied message', async () => {
    serviceSpy.getClientEntries.and.returnValue(
      throwError(() => ({ error: { message: 'This client has not shared their progress with you.' } }))
    );
    actions$ = of(A.loadClientProgressEntries({ clientId: 5 }));

    const result = await firstValueFrom(effects.loadClientProgressEntries$);

    expect(result).toEqual(A.loadClientProgressEntriesFailure({ error: 'This client has not shared their progress with you.' }));
  });
});
