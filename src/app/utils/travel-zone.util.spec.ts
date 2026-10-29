import { TRAVEL_FEE, parseMapsLink, travelZoneFor } from './travel-zone.util';

describe('travel zones', () => {
  it('reads coordinates from the common Google Maps link formats', () => {
    expect(parseMapsLink('https://www.google.com/maps/place/Evolve/@49.2745,-123.1210,17z/data=!3m1')).toEqual({ latitude: 49.2745, longitude: -123.121 });
    expect(parseMapsLink('https://www.google.com/maps/place/x/@49.0,-123.0,17z/data=!8m2!3d49.2745!4d-123.121')?.latitude).toBe(49.2745);
    expect(parseMapsLink('https://maps.google.com/?q=49.2827,-123.1207')?.longitude).toBe(-123.1207);
    expect(parseMapsLink('49.28, -123.12')?.latitude).toBe(49.28);
  });

  it('gives nothing for short links, bare names, other sites and bad numbers', () => {
    for (const bad of [null, '', '   ', 'https://maps.app.goo.gl/abc123', 'https://www.google.com/maps/place/Evolve+Strength',
      'https://evil.example.com/maps/@49.2,-123.1,17z', 'javascript:alert(1)', '95.0, -123.0']) {
      expect(parseMapsLink(bad)).toBeNull();
    }
  });

  it('puts downtown gyms in the free core, the suburbs at +30 and further out at +50', () => {
    expect(travelZoneFor({ latitude: 49.2745, longitude: -123.121 })).toBe('DOWNTOWN');
    expect(travelZoneFor({ latitude: 49.2276, longitude: -123.0076 })).toBe('NEARBY'); // Burnaby
    expect(travelZoneFor({ latitude: 49.1913, longitude: -122.849 })).toBe('NEARBY'); // Surrey
    expect(travelZoneFor({ latitude: 49.0504, longitude: -122.3045 })).toBe('FAR'); // Abbotsford
    expect([TRAVEL_FEE.DOWNTOWN, TRAVEL_FEE.NEARBY, TRAVEL_FEE.FAR]).toEqual([0, 30, 50]);
  });
});
