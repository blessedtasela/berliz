export interface Country {
    id: number;
    name: string;
    iso2: string;
    iso3: string;

    /** Same value as iso2 — the form control's bound value for the country select. */
    code?: string;
    /** "+" prefixed dial code, e.g. "+1", derived from phoneCode. */
    dialCode?: string;

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