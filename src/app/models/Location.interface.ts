export interface Country {
    id: number;
    name: string;
    iso2: string;
    iso3: string;

    // Populated by LocationService's REST Countries-backed lookup (see
    // location.service.ts) alongside phoneCode/emoji below — that lookup
    // builds objects with these field names instead, so both sets of fields
    // exist on a Country depending on which source produced it.
    code?: string;
    dialCode?: string;
    flag?: string;

    phoneCode?: string;

    capital?: string;
    currency?: string;
    currencyName?: string;
    currencySymbol?: string;

    region?: string;
    subregion?: string;

    nationality?: string;

    emoji?: string;
    emojiU?: string;

    latitude?: number;
    longitude?: number;

    population?: number;

    states: State[];
}

export interface State {
    id: number;
    name: string;
    iso2?: string;
    type?: string;
    cities: City[];
}

export interface City {
    id: number;
    name: string;
    latitude?: number;
    longitude?: number;
}