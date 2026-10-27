import { emptyOnboarding } from '../client-onboarding.options';
import { buildSections } from './onboarding-summary.component';

describe('buildSections', () => {
  it('shows nothing for a profile with no answers', () => {
    expect(buildSections(emptyOnboarding())).toEqual([]);
  });

  it('uses readable labels, leaves out empty answers and marks the health section private', () => {
    const o = {
      ...emptyOnboarding(),
      started: true,
      locationType: 'other_gym', gymName: 'Iron House', gymCity: 'Calgary',
      trainingMode: 'hybrid',
      fitnessLevel: 'beginner',
      goals: ['strength', 'fat_loss'],
      injuries: 'Left knee, recovering',
      availableDays: ['mon', 'wed'],
      sessionMinutes: 45,
    };
    const sections = buildSections(o);
    const titles = sections.map(s => s.title);
    expect(titles).toEqual(['Training setup', 'Fitness level and history', 'Goals', 'Health and safety', 'Schedule and preferences']);

    const setup = sections[0].rows;
    expect(setup.find(r => r.label === 'Where they train')?.value).toBe('Iron House, Calgary');
    expect(setup.find(r => r.label === 'How they train')?.value).toBe('Both (hybrid)');
    expect(sections[2].rows[0].value).toBe('Strength, Fat loss');
    expect(sections[3].health).toBeTrue();
    expect(sections[4].rows.find(r => r.label === 'Session length')?.value).toBe('45 minutes');
    expect(sections[4].rows.find(r => r.label === 'Days')?.value).toBe('Mon, Wed');
  });

  it('names the chosen center', () => {
    const o = { ...emptyOnboarding(), started: true, locationType: 'center', centerName: 'M Fitness Sources' };
    expect(buildSections(o)[0].rows[0].value).toBe('M Fitness Sources');
  });
});
