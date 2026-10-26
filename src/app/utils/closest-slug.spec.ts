import { closestBySlug, editDistance, nameSlug } from './closest-slug';

describe('closest-slug', () => {
  describe('nameSlug', () => {
    it('lowercases and dashes the spaces, like the route param', () => {
      expect(nameSlug('Blessed Fit')).toBe('blessed-fit');
    });

    it('is empty for a missing name', () => {
      expect(nameSlug(null)).toBe('');
      expect(nameSlug(undefined)).toBe('');
    });
  });

  describe('editDistance', () => {
    it('counts inserts, deletes and substitutions', () => {
      expect(editDistance('blessed-fit', 'blessed-fit')).toBe(0);
      expect(editDistance('blessed-fit', 'blessed-fitt')).toBe(1);
      expect(editDistance('blessed-fit', 'blesed-fit')).toBe(1);
      expect(editDistance('blessed-fit', 'blessed-fat')).toBe(1);
      expect(editDistance('', 'abc')).toBe(3);
    });
  });

  describe('closestBySlug', () => {
    const trainers = [{ name: 'Blessed Fit' }, { name: 'Ada Online' }];
    const slugOf = (t: { name: string }) => nameSlug(t.name);

    it('finds the trainer a one-character typo was meant for', () => {
      expect(closestBySlug('blesed-fit', trainers, slugOf)).toBe(trainers[0]);
    });

    it('finds the trainer within two edits', () => {
      expect(closestBySlug('blessd-fitt', trainers, slugOf)).toBe(trainers[0]);
    });

    it('is case-insensitive', () => {
      expect(closestBySlug('BLESSED-FIT', trainers, slugOf)).toBe(trainers[0]);
    });

    it('gives up when nothing is a plausible typo', () => {
      expect(closestBySlug('blessed-tasela', trainers, slugOf)).toBeNull();
    });

    it('gives up on an empty list', () => {
      expect(closestBySlug('blessed-fit', [], slugOf)).toBeNull();
    });
  });
});
