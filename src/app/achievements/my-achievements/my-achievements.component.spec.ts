import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import {
  AchievementForm, MyAchievementsComponent, toDateInput, toRequest, validateAchievement
} from './my-achievements.component';
import { AchievementService } from 'src/app/services/achievement.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { FitnessAchievement } from 'src/app/models/fitness-achievement.model';

const form = (over: Partial<AchievementForm> = {}): AchievementForm => ({
  name: 'First 10k', description: '', date: '2026-09-01', certificate: null, ...over,
});

describe('achievement form helpers', () => {
  const now = new Date(2026, 9, 7, 15, 0, 0); // 7 Oct 2026, local

  it('accepts a normal achievement', () => {
    expect(validateAchievement(form(), now)).toBeNull();
  });

  it('needs a name of 2 to 100 characters', () => {
    expect(validateAchievement(form({ name: '' }), now)).toContain('name');
    expect(validateAchievement(form({ name: ' x ' }), now)).toContain('name');
    expect(validateAchievement(form({ name: 'n'.repeat(101) }), now)).toContain('name');
    expect(validateAchievement(form({ name: 'n'.repeat(100) }), now)).toBeNull();
  });

  it('caps the description at 1000 characters', () => {
    expect(validateAchievement(form({ description: 'd'.repeat(1001) }), now)).toContain('1000');
    expect(validateAchievement(form({ description: 'd'.repeat(1000) }), now)).toBeNull();
  });

  it('allows today but not a later day', () => {
    expect(validateAchievement(form({ date: '2026-10-07' }), now)).toBeNull();
    expect(validateAchievement(form({ date: '2026-10-08' }), now)).toContain('future');
  });

  it('allows leaving the date blank (the server defaults it)', () => {
    expect(validateAchievement(form({ date: '' }), now)).toBeNull();
  });

  it('builds a trimmed request with blanks as null and the id only when editing', () => {
    const add = toRequest(form({ name: '  Medal  ', description: '   ', certificate: null }));
    expect(add.name).toBe('Medal');
    expect(add.description).toBeNull();
    expect(add.certificate).toBeNull();
    expect('id' in add).toBeFalse();

    expect(toRequest(form(), 7).id).toBe(7);
  });

  it('sends the date at local noon so the calendar day survives any timezone', () => {
    const iso = toRequest(form({ date: '2026-09-01' })).date!;
    const d = new Date(iso);
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([2026, 9, 1]);
    expect(toDateInput(iso)).toBe('2026-09-01');
  });

  it('toDateInput tolerates empty and invalid input', () => {
    expect(toDateInput(null)).toBe('');
    expect(toDateInput('not a date')).toBe('');
  });
});

describe('MyAchievementsComponent', () => {
  let component: MyAchievementsComponent;
  let fixture: ComponentFixture<MyAchievementsComponent>;
  let service: jasmine.SpyObj<AchievementService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const sample: FitnessAchievement = { id: 3, name: 'Half marathon', description: 'Sub 2h', certificate: '/uploads/x.pdf', date: '2026-08-01T12:00:00Z' };

  beforeEach(() => {
    service = jasmine.createSpyObj<AchievementService>('AchievementService', ['getMine', 'add', 'update', 'delete']);
    service.getMine.and.returnValue(of({ data: [sample] } as any));
    snackBar = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [MyAchievementsComponent],
      providers: [
        { provide: AchievementService, useValue: service },
        { provide: SnackBarService, useValue: snackBar },
        { provide: StrapiService, useValue: jasmine.createSpyObj('StrapiService', ['uploadToStrapi']) },
      ],
    });
    fixture = TestBed.createComponent(MyAchievementsComponent);
    component = fixture.componentInstance;
  });

  it('loads the signed-in user\'s achievements', () => {
    fixture.detectChanges();
    expect(component.achievements).toEqual([sample]);
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeFalse();
  });

  it('a failed load is an error state, never an empty list', () => {
    service.getMine.and.returnValue(throwError(() => new Error('down')));
    fixture.detectChanges();
    expect(component.loadError).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain("Couldn't load your achievements");
    expect(fixture.nativeElement.textContent).not.toContain('No achievements yet');
  });

  it('shows the empty state only when the load succeeded with nothing', () => {
    service.getMine.and.returnValue(of({ data: [] } as any));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No achievements yet');
  });

  it('does not call the server for an invalid form and shows why', () => {
    fixture.detectChanges();
    component.openAdd();
    component.form.name = '';
    component.save();
    expect(service.add).not.toHaveBeenCalled();
    expect(component.formError).toContain('name');
  });

  it('adds a new achievement, closes the form and reloads', () => {
    fixture.detectChanges();
    service.add.and.returnValue(of({ message: 'Achievement added', data: sample } as any));
    component.openAdd();
    component.form.name = 'Half marathon';

    component.save();

    expect(service.add).toHaveBeenCalledTimes(1);
    expect(service.add.calls.mostRecent().args[0].name).toBe('Half marathon');
    expect(component.editing).toBeNull();
    expect(service.getMine).toHaveBeenCalledTimes(2);
  });

  it('editing sends an update with the achievement id', () => {
    fixture.detectChanges();
    service.update.and.returnValue(of({ message: 'ok', data: sample } as any));
    component.openEdit(sample);
    component.form.name = 'Half marathon (PB)';

    component.save();

    expect(service.update).toHaveBeenCalledTimes(1);
    expect(service.update.calls.mostRecent().args[0].id).toBe(3);
    expect(service.add).not.toHaveBeenCalled();
  });

  it('keeps the form open and shows the server message when saving fails', () => {
    fixture.detectChanges();
    service.add.and.returnValue(throwError(() => ({ error: { message: 'An achievement can\'t be dated in the future.' } })));
    component.openAdd();
    component.form.name = 'Valid name';

    component.save();

    expect(component.editing).toBe('new');
    expect(component.formError).toContain('future');
    expect(component.saving).toBeFalse();
  });

  it('delete needs a confirmation, then removes it from the list', () => {
    fixture.detectChanges();
    service.delete.and.returnValue(of({} as any));

    component.askDelete(sample);
    expect(component.confirmingDeleteId).toBe(3);
    expect(service.delete).not.toHaveBeenCalled();

    component.confirmDelete(sample);
    expect(service.delete).toHaveBeenCalledWith(3);
    expect(component.achievements).toEqual([]);
    expect(component.confirmingDeleteId).toBeNull();
  });
});
