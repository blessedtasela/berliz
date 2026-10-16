import { TrainerLocation, Trainers } from 'src/app/models/trainers.interface';

/**
 * A trainer lists the CITIES they cover; within a city they can list several SPOTS (gyms, parks, studios).
 * The API stores a flat list of rows -- one per spot, or one bare row for a city with no particular spot --
 * so the editor works on cities with spots nested inside, and these helpers convert both ways.
 */
export type LocationPrecision = 'EXACT' | 'AREA';

export interface TrainerSpot {
  /** Gym or place name. */
  venue: string;
  /** Street address, or a description of the area. */
  address: string;
  /** How precise `address` is: a real address, or only a general area. */
  precision: LocationPrecision;
  /** Extra charge for training at this spot; null = none. */
  fee: number | null;
}

export interface TrainerArea {
  country: string;
  stateProvince: string;
  city: string;
  /** Does the trainer come to the client's own place in this city? */
  clientAllowed: boolean;
  /** Fee for that; null = use the trainer-wide default, 0 = free. */
  clientFee: number | null;
  spots: TrainerSpot[];
}

/** The fields of one saved row, as the API takes them. */
export interface TrainerLocationPayload {
  country: string;
  stateProvince: string | null;
  city: string;
  venue: string | null;
  address: string | null;
  locationPrecision: LocationPrecision | null;
  fee: number | null;
  clientLocationAllowed: boolean;
  clientLocationFee: number | null;
}

/** Case, accents and spacing never decide whether two place names are the same ("Montréal" == "montreal"). */
export function normPlace(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD').replace(/\p{M}+/gu, '')
    .trim().replace(/\s+/g, ' ').toLowerCase();
}

/** A blank state on either side is a wildcard (a client may not know it); otherwise they must match. */
function statesCompatible(a: string | null | undefined, b: string | null | undefined): boolean {
  return !normPlace(a) || !normPlace(b) || normPlace(a) === normPlace(b);
}

export function sameCity(
  a: { country?: string | null; stateProvince?: string | null; city?: string | null },
  b: { country?: string | null; stateProvince?: string | null; city?: string | null },
): boolean {
  return normPlace(a.country) === normPlace(b.country)
    && normPlace(a.city) === normPlace(b.city)
    && statesCompatible(a.stateProvince, b.stateProvince);
}

/** "Toronto, Ontario, Canada" -- the state is left out when there isn't one. */
export function placeLabel(place: { city?: string | null; stateProvince?: string | null; country?: string | null }): string {
  return [place.city, place.stateProvince, place.country].filter(part => !!part && String(part).trim()).join(', ');
}

/** A bare city row has nothing about a particular spot; it only says "I cover this city". */
function isBareRow(row: TrainerLocation): boolean {
  return !row.venue?.trim() && !row.address?.trim() && !(row.fee && row.fee > 0);
}

/** Saved rows -> cities with their spots, in the order the cities first appear. */
export function groupLocations(rows: TrainerLocation[] | null | undefined): TrainerArea[] {
  const areas: TrainerArea[] = [];
  for (const row of rows ?? []) {
    let area = areas.find(a => sameCity(a, row));
    if (!area) {
      area = {
        country: row.country,
        stateProvince: row.stateProvince ?? '',
        city: row.city,
        clientAllowed: row.clientLocationAllowed !== false,
        clientFee: row.clientLocationFee ?? null,
        spots: [],
      };
      areas.push(area);
    } else {
      // Any spot disallowing it disallows the city; the first fee given wins -- the same read rule as the server.
      if (row.clientLocationAllowed === false) area.clientAllowed = false;
      if (area.clientFee === null && row.clientLocationFee != null) area.clientFee = row.clientLocationFee;
      if (!area.stateProvince && row.stateProvince) area.stateProvince = row.stateProvince;
    }
    if (!isBareRow(row)) {
      area.spots.push({
        venue: row.venue ?? '',
        address: row.address ?? '',
        precision: row.locationPrecision === 'AREA' ? 'AREA' : 'EXACT',
        fee: row.fee ?? null,
      });
    }
  }
  return areas;
}

function cleanFee(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Like cleanFee, but 0 is kept: for fees where null means "use the default" and 0 means "free". */
export function cleanFeeKeepZero(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Cities with spots -> the flat rows the API takes. A city with no spot still gets one bare row, so it isn't lost. */
export function flattenAreas(areas: TrainerArea[] | null | undefined): TrainerLocationPayload[] {
  const rows: TrainerLocationPayload[] = [];
  for (const area of areas ?? []) {
    const country = (area.country ?? '').trim();
    const city = (area.city ?? '').trim();
    if (!country || !city) continue;
    const state = (area.stateProvince ?? '').trim() || null;
    const clientLocationFee = cleanFeeKeepZero(area.clientFee);

    const base = { country, stateProvince: state, city, clientLocationAllowed: area.clientAllowed !== false, clientLocationFee };
    const spots = (area.spots ?? []).filter(s => s.venue?.trim() || s.address?.trim() || cleanFee(s.fee) !== null);

    if (spots.length === 0) {
      rows.push({ ...base, venue: null, address: null, locationPrecision: null, fee: null });
      continue;
    }
    for (const spot of spots) {
      const address = spot.address?.trim() || null;
      rows.push({
        ...base,
        venue: spot.venue?.trim() || null,
        address,
        locationPrecision: address ? (spot.precision === 'AREA' ? 'AREA' : 'EXACT') : null,
        fee: cleanFee(spot.fee),
      });
    }
  }
  return rows;
}

// ── Training at the client's OWN place ─────────────────────────────────────

export interface ClientPlace {
  country?: string | null;
  stateProvince?: string | null;
  city?: string | null;
}

export type ClientLocationQuote =
  | { ok: true; fee: number | null; insideListedCity: boolean }
  | { ok: false; reason: 'NOT_OFFERED' | 'CITY_NOT_ALLOWED' | 'OUTSIDE_NOT_ALLOWED' };

/**
 * What it costs (or whether it's allowed) for the trainer to come to a client's own place, by where that place
 * is. The same rules as the server's ClientLocationRules -- the server is the authority when the booking is
 * made; this lets the booking form show the right price and the right message before then.
 *
 *  - inside a city the trainer lists: that city's fee, else the trainer-wide fee; refused if the city is switched off
 *  - outside every listed city: the outside fee, else the trainer-wide fee; refused if they only work in their cities
 *  - no country/city given: the trainer-wide fee
 */
export function quoteClientLocation(
  trainer: Pick<Trainers, 'customLocationAllowed' | 'customLocationFee' | 'customLocationOutsideAllowed' | 'customLocationOutsideFee' | 'locations'>,
  place: ClientPlace,
): ClientLocationQuote {
  if (!trainer.customLocationAllowed) return { ok: false, reason: 'NOT_OFFERED' };

  const base = trainer.customLocationFee ?? null;
  if (!normPlace(place.country) || !normPlace(place.city)) return { ok: true, fee: base, insideListedCity: false };

  const inCity = (trainer.locations ?? []).filter(l => sameCity(l, place));
  if (inCity.length > 0) {
    if (inCity.some(l => l.clientLocationAllowed === false)) return { ok: false, reason: 'CITY_NOT_ALLOWED' };
    const own = inCity.map(l => l.clientLocationFee).find(f => f !== null && f !== undefined);
    return { ok: true, fee: own ?? base, insideListedCity: true };
  }

  if (trainer.customLocationOutsideAllowed === false) return { ok: false, reason: 'OUTSIDE_NOT_ALLOWED' };
  return { ok: true, fee: trainer.customLocationOutsideFee ?? base, insideListedCity: false };
}
