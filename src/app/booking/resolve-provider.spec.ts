import { of, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { providerSlug, resolveProviderBySlug } from './resolve-provider';

describe('resolveProviderBySlug', () => {
  const trainers = (data: any[]) => ({ getActiveTrainers: () => of({ data }) }) as any;
  const centers = (data: any[]) => ({ getActiveCenters: () => of({ data }) }) as any;
  const strapi = environment.strapiUrl.replace(/\/$/, '');

  it('turns a Strapi photo path into a full URL so the image actually loads', done => {
    const service = trainers([{ id: 1, name: 'Coach Sam', photoResponse: { photoUrl: '/uploads/sam_abc123.jpg' } }]);

    resolveProviderBySlug('trainer', 'Coach-Sam', service, centers([])).subscribe(provider => {
      expect(provider!.photoUrl).toBe(`${strapi}/uploads/sam_abc123.jpg`);
      done();
    });
  });

  // Regression: the booking page showed the default avatar because the raw "/uploads/..." path was requested from
  // the website's own origin instead of Strapi's.
  it('leaves an already-complete photo URL alone', done => {
    const service = trainers([{ id: 1, name: 'Coach Sam', photoResponse: { photoUrl: 'https://cdn.example.com/sam.jpg' } }]);

    resolveProviderBySlug('trainer', 'coach-sam', service, centers([])).subscribe(provider => {
      expect(provider!.photoUrl).toBe('https://cdn.example.com/sam.jpg');
      done();
    });
  });

  it('gives null (so the page shows its fallback) when the provider has no photo', done => {
    const service = trainers([{ id: 1, name: 'Coach Sam', photoResponse: null }]);

    resolveProviderBySlug('trainer', 'Coach-Sam', service, centers([])).subscribe(provider => {
      expect(provider!.photoUrl).toBeNull();
      done();
    });
  });

  it('resolves a center photo the same way', done => {
    const service = centers([{ id: 4, name: 'Iron Gym', photoResponse: { photoUrl: 'uploads/gym.png' } }]);

    resolveProviderBySlug('center', 'Iron-Gym', trainers([]), service).subscribe(provider => {
      expect(provider!.id).toBe(4);
      expect(provider!.photoUrl).toBe(`${strapi}/uploads/gym.png`);
      done();
    });
  });

  it('finds nothing for an unknown name or a failed lookup', done => {
    resolveProviderBySlug('trainer', 'Nobody', trainers([{ id: 1, name: 'Coach Sam' }]), centers([])).subscribe(provider => {
      expect(provider).toBeNull();

      const failing = { getActiveTrainers: () => throwError(() => new Error('down')) } as any;
      resolveProviderBySlug('trainer', 'Coach-Sam', failing, centers([])).subscribe(second => {
        expect(second).toBeNull();
        done();
      });
    });
  });

  it('makes the URL segment from the name', () => {
    expect(providerSlug('Coach Sam Lee')).toBe('Coach-Sam-Lee');
  });
});
