import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAchievementsComponent } from './profile-achievements.component';
import { PublicAchievement } from 'src/app/models/fitness-achievement.model';

describe('ProfileAchievementsComponent', () => {
  let fixture: ComponentFixture<ProfileAchievementsComponent>;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  const sample = (over: Partial<PublicAchievement> = {}): PublicAchievement => ({
    id: 1, name: 'First 10k', description: 'Under an hour', date: '2026-09-01T12:00:00Z', hasCertificate: false, ...over,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProfileAchievementsComponent] });
    fixture = TestBed.createComponent(ProfileAchievementsComponent);
  });

  it('renders nothing at all when there are no achievements (or none were sent)', () => {
    fixture.componentInstance.achievements = [];
    fixture.detectChanges();
    expect(text().trim()).toBe('');

    fixture.componentInstance.achievements = undefined;
    fixture.detectChanges();
    expect(text().trim()).toBe('');
  });

  it('lists each achievement with its name, details and count', () => {
    fixture.componentInstance.achievements = [sample(), sample({ id: 2, name: 'Black belt', description: null })];
    fixture.detectChanges();
    expect(text()).toContain('Achievements');
    expect(text()).toContain('First 10k');
    expect(text()).toContain('Under an hour');
    expect(text()).toContain('Black belt');
    expect(text()).toContain('2');
  });

  it('says a certificate exists but never links to a file', () => {
    fixture.componentInstance.achievements = [sample({ hasCertificate: true })];
    fixture.detectChanges();
    expect(text()).toContain('Certificate on file');
    expect((fixture.nativeElement as HTMLElement).querySelector('a')).toBeNull();
  });

  it('does not claim a certificate when there is none', () => {
    fixture.componentInstance.achievements = [sample({ hasCertificate: false })];
    fixture.detectChanges();
    expect(text()).not.toContain('Certificate on file');
  });
});
