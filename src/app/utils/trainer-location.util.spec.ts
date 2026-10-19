import { TrainerLocation } from 'src/app/models/trainers.interface';
import {
  clientPlaceFeeLabel, flattenAreas, groupLocations, isApproximateSpot, normPlace, placeLabel, quoteClientLocation, sameCity, spotAddress, spotHeading, TrainerArea,
} from './trainer-location.util';

const row = (over: Partial<TrainerLocation>): TrainerLocation => ({
  country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver', ...over,
});

describe('trainer-location util', () => {

  describe('place names', () => {
    it('ignores case, accents and spacing', () => {
      expect(normPlace('  Montréal ')).toBe('montreal');
      expect(normPlace('british   COLUMBIA')).toBe('british columbia');
      expect(normPlace(null)).toBe('');
    });

    it('treats a blank state as a wildcard but a different state as a different place', () => {
      expect(sameCity({ country: 'Canada', city: 'Vancouver' }, { country: 'canada', stateProvince: 'BC', city: 'vancouver' })).toBeTrue();
      expect(sameCity(
        { country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver' },
        { country: 'Canada', stateProvince: 'Washington', city: 'Vancouver' })).toBeFalse();
      expect(sameCity({ country: 'Canada', city: 'Vancouver' }, { country: 'USA', city: 'Vancouver' })).toBeFalse();
    });

    it('labels a place, leaving out what is blank', () => {
      expect(placeLabel({ city: 'Toronto', stateProvince: 'Ontario', country: 'Canada' })).toBe('Toronto, Ontario, Canada');
      expect(placeLabel({ city: 'Burnaby', stateProvince: '', country: 'Canada' })).toBe('Burnaby, Canada');
    });
  });

  describe('grouping saved rows into cities with spots', () => {
    it('puts several spots of one city under that city', () => {
      const areas = groupLocations([
        row({ venue: "Gold's Gym", address: '1234 W Broadway', locationPrecision: 'EXACT', fee: 5 }),
        row({ venue: 'Kits Beach', address: 'near Kitsilano Beach', locationPrecision: 'AREA' }),
        row({ city: 'Burnaby' }),
      ]);

      expect(areas.length).toBe(2);
      expect(areas[0].city).toBe('Vancouver');
      expect(areas[0].spots.length).toBe(2);
      expect(areas[0].spots[0]).toEqual({ venue: "Gold's Gym", address: '1234 W Broadway', precision: 'EXACT', fee: 5 });
      expect(areas[0].spots[1].precision).toBe('AREA');
      expect(areas[1].city).toBe('Burnaby');
      expect(areas[1].spots).toEqual([], 'a bare row is just "I cover this city", not a spot');
    });

    it('reads the client-place rule per city: any spot disallowing it disallows the city, the first fee wins', () => {
      const [vancouver] = groupLocations([
        row({ venue: 'A', clientLocationFee: 10 }),
        row({ venue: 'B', clientLocationAllowed: false, clientLocationFee: 99 }),
      ]);

      expect(vancouver.clientAllowed).toBeFalse();
      expect(vancouver.clientFee).toBe(10);
    });

    it('treats a missing allowed flag as yes and keeps a zero fee as free', () => {
      const [area] = groupLocations([row({ clientLocationFee: 0 })]);

      expect(area.clientAllowed).toBeTrue();
      expect(area.clientFee).toBe(0);
    });

    it('is happy with nothing', () => {
      expect(groupLocations(null)).toEqual([]);
      expect(groupLocations(undefined)).toEqual([]);
    });

    it('matches a city whatever the saved casing or accents', () => {
      const areas = groupLocations([row({ city: 'Montréal', stateProvince: 'Québec' }), row({ city: 'montreal', stateProvince: 'quebec', venue: 'Gym' })]);

      expect(areas.length).toBe(1);
      expect(areas[0].spots.length).toBe(1);
    });
  });

  describe('flattening cities with spots into rows', () => {
    const vancouver = (over: Partial<TrainerArea> = {}): TrainerArea => ({
      country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver', clientAllowed: true, clientFee: null, spots: [], ...over,
    });

    it('writes one row per spot, each carrying the city rule', () => {
      const rows = flattenAreas([vancouver({
        clientFee: 10,
        spots: [
          { venue: "Gold's Gym", address: '1234 W Broadway', precision: 'EXACT', fee: 5 },
          { venue: 'Kits Beach', address: 'near Kits', precision: 'AREA', fee: null },
        ],
      })]);

      expect(rows.length).toBe(2);
      expect(rows.every(r => r.clientLocationFee === 10 && r.clientLocationAllowed)).toBeTrue();
      expect(rows[0]).toEqual(jasmine.objectContaining({ venue: "Gold's Gym", address: '1234 W Broadway', locationPrecision: 'EXACT', fee: 5 }));
      expect(rows[1]).toEqual(jasmine.objectContaining({ venue: 'Kits Beach', locationPrecision: 'AREA', fee: null }));
    });

    it('keeps a city that has no spot as one bare row', () => {
      const rows = flattenAreas([vancouver()]);

      expect(rows.length).toBe(1);
      expect(rows[0]).toEqual(jasmine.objectContaining({ city: 'Vancouver', venue: null, address: null, locationPrecision: null, fee: null }));
    });

    it('drops a spot left completely blank, and a blank address has no precision', () => {
      const rows = flattenAreas([vancouver({ spots: [
        { venue: '', address: '  ', precision: 'AREA', fee: null },
        { venue: 'Home studio', address: '', precision: 'AREA', fee: null },
      ] })]);

      expect(rows.length).toBe(1);
      expect(rows[0].venue).toBe('Home studio');
      expect(rows[0].locationPrecision).toBeNull();
    });

    it('keeps a zero city fee as free, and a blank one as "use the default"', () => {
      expect(flattenAreas([vancouver({ clientFee: 0 })])[0].clientLocationFee).toBe(0);
      expect(flattenAreas([vancouver({ clientFee: null })])[0].clientLocationFee).toBeNull();
    });

    it('turns a spot fee of zero or blank into no fee', () => {
      const rows = flattenAreas([vancouver({ spots: [{ venue: 'Gym', address: '', precision: 'EXACT', fee: 0 }] })]);

      expect(rows[0].fee).toBeNull();
    });

    it('skips a city with no country or no name', () => {
      expect(flattenAreas([vancouver({ city: ' ' }), vancouver({ country: '' })])).toEqual([]);
    });

    it('round-trips: saved rows -> cities -> rows', () => {
      const saved: TrainerLocation[] = [
        row({ venue: "Gold's Gym", address: '1234 W Broadway', locationPrecision: 'EXACT', fee: 5, clientLocationFee: 10 }),
        row({ venue: 'Kits Beach', address: 'near Kits', locationPrecision: 'AREA', clientLocationFee: 10 }),
        row({ city: 'Burnaby', clientLocationAllowed: false }),
      ];

      const again = flattenAreas(groupLocations(saved));

      expect(again.length).toBe(3);
      expect(again.map(r => r.city)).toEqual(['Vancouver', 'Vancouver', 'Burnaby']);
      expect(again[2].clientLocationAllowed).toBeFalse();
    });
  });

  describe('training at the client\'s own place', () => {
    const trainer = (over: any = {}) => ({
      customLocationAllowed: true,
      customLocationFee: 20,
      customLocationOutsideAllowed: undefined as boolean | undefined,
      customLocationOutsideFee: null as number | null,
      locations: [
        row({ venue: "Gold's Gym", clientLocationFee: 10 }),
        row({ venue: 'Kits Beach', clientLocationFee: 10 }),
        row({ city: 'Burnaby' }),
      ],
      ...over,
    });

    it('uses the city\'s own fee inside a listed city', () => {
      expect(quoteClientLocation(trainer(), { country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver' }))
        .toEqual({ ok: true, fee: 10, insideListedCity: true });
    });

    it('falls back to the trainer-wide fee in a listed city with no fee of its own', () => {
      expect(quoteClientLocation(trainer(), { country: 'Canada', city: 'Burnaby' })).toEqual({ ok: true, fee: 20, insideListedCity: true });
    });

    it('treats a zero city fee as free, not as "use the default"', () => {
      const t = trainer({ locations: [row({ clientLocationFee: 0 })] });

      expect(quoteClientLocation(t, { country: 'Canada', city: 'Vancouver' })).toEqual({ ok: true, fee: 0, insideListedCity: true });
    });

    it('uses the outside fee outside every listed city, else the trainer-wide fee', () => {
      expect(quoteClientLocation(trainer({ customLocationOutsideFee: 45 }), { country: 'Canada', city: 'Calgary' }))
        .toEqual({ ok: true, fee: 45, insideListedCity: false });
      expect(quoteClientLocation(trainer(), { country: 'Canada', city: 'Calgary' }))
        .toEqual({ ok: true, fee: 20, insideListedCity: false });
    });

    it('refuses outside the listed cities when the trainer only works in them, but not inside', () => {
      const t = trainer({ customLocationOutsideAllowed: false });

      expect(quoteClientLocation(t, { country: 'Canada', city: 'Calgary' })).toEqual({ ok: false, reason: 'OUTSIDE_NOT_ALLOWED' });
      expect(quoteClientLocation(t, { country: 'Canada', city: 'Vancouver' }).ok).toBeTrue();
    });

    it('refuses a city the trainer does not travel inside', () => {
      const t = trainer({ locations: [row({ city: 'Burnaby', clientLocationAllowed: false }), row({})] });

      expect(quoteClientLocation(t, { country: 'Canada', city: 'Burnaby' })).toEqual({ ok: false, reason: 'CITY_NOT_ALLOWED' });
    });

    it('refuses everything when the trainer does not offer it at all', () => {
      expect(quoteClientLocation(trainer({ customLocationAllowed: false }), { country: 'Canada', city: 'Vancouver' }))
        .toEqual({ ok: false, reason: 'NOT_OFFERED' });
    });

    it('quotes the trainer-wide fee when no area is given', () => {
      expect(quoteClientLocation(trainer(), {})).toEqual({ ok: true, fee: 20, insideListedCity: false });
      expect(quoteClientLocation(trainer(), { city: 'Vancouver' })).toEqual({ ok: true, fee: 20, insideListedCity: false });
    });

    it('matches regardless of case and accents, and a same-named city elsewhere is outside', () => {
      const t = trainer({ customLocationOutsideFee: 60, locations: [row({ city: 'Montréal', stateProvince: 'Québec', clientLocationFee: 12 })] });

      expect(quoteClientLocation(t, { country: ' canada ', stateProvince: 'QUEBEC', city: 'montreal' }))
        .toEqual({ ok: true, fee: 12, insideListedCity: true });
      expect(quoteClientLocation(t, { country: 'United States', stateProvince: 'Washington', city: 'Montréal' }))
        .toEqual({ ok: true, fee: 60, insideListedCity: false });
    });
  });

  describe('how a spot reads', () => {
    it('heads a spot with its name, else its address, and shows the address under a name', () => {
      expect(spotHeading({ venue: 'Gym', address: 'A St' })).toBe('Gym');
      expect(spotAddress({ venue: 'Gym', address: 'A St' })).toBe('A St');
      expect(spotHeading({ venue: '', address: 'near the beach' })).toBe('near the beach');
      expect(spotAddress({ venue: '', address: 'near the beach' })).toBe('');
      expect(spotHeading({})).toBe('');
    });

    it('is approximate only for a general area that has an address', () => {
      expect(isApproximateSpot({ locationPrecision: 'AREA', address: 'near the beach' })).toBeTrue();
      expect(isApproximateSpot({ locationPrecision: 'AREA', address: '' })).toBeFalse();
      expect(isApproximateSpot({ locationPrecision: 'EXACT', address: 'A St' })).toBeFalse();
    });
  });

  describe("the fee range for training at the client's place", () => {
    const t = (over: any = {}) => ({ customLocationAllowed: true, customLocationFee: 25, locations: [], ...over });

    it('is one fee when it is the same everywhere, or none', () => {
      expect(clientPlaceFeeLabel(t())).toBe('+$25.00');
      expect(clientPlaceFeeLabel(t({ customLocationFee: null }))).toBe('No extra fee');
    });

    it('is a range when a city or the outside costs differently', () => {
      expect(clientPlaceFeeLabel(t({ locations: [row({ clientLocationFee: 10 })], customLocationOutsideFee: 40 }))).toBe('+$10.00 – $40.00');
    });

    it('says "up to" when some places are free', () => {
      expect(clientPlaceFeeLabel(t({ locations: [row({ clientLocationFee: 0 })], customLocationOutsideFee: 40 }))).toBe('up to +$40.00');
    });

    it('leaves out the outside when they only work inside their cities, and a city switched off', () => {
      const label = clientPlaceFeeLabel(t({
        customLocationOutsideAllowed: false,
        locations: [row({ clientLocationFee: 10 }), row({ city: 'Burnaby', clientLocationAllowed: false, clientLocationFee: 99 })],
      }));
      expect(label).toBe('+$10.00');
    });

    it('is null when it is not offered anywhere', () => {
      expect(clientPlaceFeeLabel(t({ customLocationAllowed: false }))).toBeNull();
      expect(clientPlaceFeeLabel(t({ customLocationOutsideAllowed: false, locations: [row({ clientLocationAllowed: false })] }))).toBeNull();
      expect(clientPlaceFeeLabel(null)).toBeNull();
    });
  });
});
