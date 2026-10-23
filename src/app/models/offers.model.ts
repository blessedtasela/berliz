export interface Offers {
    id: number;
    title: string;
    description: string;
    subTitle: string;
    iconUrl: string;
    /** When set, the card links to /services/<slug>. */
    slug?: string;
  }