import { BERLIZ_SERVICES, findService, trainersForService } from './berliz-services';

describe('Berliz services content', () => {
  it('lists the real offerings, each with the content a detail page needs', () => {
    expect(BERLIZ_SERVICES.map(s => s.slug)).toEqual(['online-training', 'hybrid-training', 'in-person-training', 'gyms-and-centers', 'shop']);
    for (const s of BERLIZ_SERVICES) {
      expect(s.title).toBeTruthy();
      expect(s.summary.length).toBeGreaterThan(40);
      expect(s.steps.length).toBe(3);
      expect(s.benefits.length).toBeGreaterThan(0);
      expect(s.bestFor.length).toBeGreaterThan(0);
    }
    expect(findService('shop')?.comingSoon).toBeFalsy();
    expect(findService('shop')?.ctaLink).toBe('/shop');
  });

  it('finds a service by slug, ignoring case', () => {
    expect(findService('Online-Training')?.title).toBe('Online personal training');
    expect(findService('nope')).toBeUndefined();
    expect(findService(null)).toBeUndefined();
  });

  it('lists the trainers who offer a mode — a hybrid coach does in-person and online too', () => {
    const trainers = [{ id: 1, serviceMode: 'ONLINE' }, { id: 2, serviceMode: 'IN_PERSON' }, { id: 3, serviceMode: 'HYBRID' }, { id: 4 }];
    const ids = (slug: string) => trainersForService(findService(slug)!, trainers).map(t => t.id);
    expect(ids('online-training')).toEqual([1, 3]);
    expect(ids('in-person-training')).toEqual([2, 3, 4]);
    expect(ids('hybrid-training')).toEqual([3]);
    expect(ids('gyms-and-centers')).toEqual([]);
    expect(ids('shop')).toEqual([]);
  });
});
