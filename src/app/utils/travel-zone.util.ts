/**
 * Travel zones for a trainer's session, measured from downtown Vancouver. Mirrors the server (TravelZones / MapsLink),
 * so the travel fee a client sees before sending a request is the one the booking is later priced with. The client
 * never measures a distance: the zone comes from the gym's Google Maps link, or the trainer settles it when accepting.
 *
 * Core (downtown / West End) up to 3.5 km: no travel fee. Up to 30 km (Surrey, Burnaby, Richmond...): CA$30. Beyond: CA$50.
 */
export type TravelZone = 'DOWNTOWN' | 'NEARBY' | 'FAR' | 'PENDING';

export interface MapPoint { latitude: number; longitude: number; }

const DOWNTOWN: MapPoint = { latitude: 49.2827, longitude: -123.1207 };
const CORE_RADIUS_KM = 3.5;
const NEARBY_RADIUS_KM = 30;
const EARTH_RADIUS_KM = 6371.0088;

export const TRAVEL_FEE: Record<TravelZone, number> = { DOWNTOWN: 0, NEARBY: 30, FAR: 50, PENDING: 0 };

const NUM = '(-?\d{1,3}(?:\.\d+)?)';
const AT = new RegExp(`@${NUM},${NUM}`);
const PIN = new RegExp(`!3d${NUM}!4d${NUM}`);
const PAIR = new RegExp(`^\s*${NUM}\s*,\s*${NUM}\s*$`);

function point(lat: string, lng: string): MapPoint | null {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!isFinite(latitude) || !isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

function isGoogleMapsUrl(text: string): boolean {
  try {
    const url = new URL(text);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const host = url.hostname.toLowerCase();
    const google = host === 'google.com' || host.endsWith('.google.com') || /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
    return google && (host.startsWith('maps.') || url.pathname.startsWith('/maps'));
  } catch {
    return false;
  }
}

/** Coordinates out of a Google Maps link (or a pasted "lat, lng"); null for a short link, a bare name or any other site. */
export function parseMapsLink(link: string | null | undefined): MapPoint | null {
  const text = (link ?? '').trim();
  if (!text || text.length > 2000) return null;
  const pair = PAIR.exec(text);
  if (pair) return point(pair[1], pair[2]);
  if (!isGoogleMapsUrl(text)) return null;
  // The place pin is more exact than the map centre, so it wins.
  const pin = PIN.exec(text);
  if (pin) return point(pin[1], pin[2]);
  const at = AT.exec(text);
  if (at) return point(at[1], at[2]);
  try {
    const url = new URL(text);
    for (const key of ['q', 'll', 'query']) {
      const value = url.searchParams.get(key);
      const m = value ? PAIR.exec(value) : null;
      if (m) return point(m[1], m[2]);
    }
  } catch { /* not a URL */ }
  return null;
}

export function distanceFromDowntownKm(p: MapPoint): number {
  const rad = (d: number) => d * Math.PI / 180;
  const dLat = rad(p.latitude - DOWNTOWN.latitude);
  const dLng = rad(p.longitude - DOWNTOWN.longitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(DOWNTOWN.latitude)) * Math.cos(rad(p.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function travelZoneFor(p: MapPoint): TravelZone {
  const km = distanceFromDowntownKm(p);
  return km <= CORE_RADIUS_KM ? 'DOWNTOWN' : km <= NEARBY_RADIUS_KM ? 'NEARBY' : 'FAR';
}

export function travelZoneLabel(zone: string | null | undefined): string {
  switch (zone) {
    case 'DOWNTOWN': return 'Downtown / West End';
    case 'NEARBY': return 'Greater Vancouver (up to 30 km)';
    case 'FAR': return 'Beyond 30 km';
    default: return 'Zone confirmed by the trainer';
  }
}
