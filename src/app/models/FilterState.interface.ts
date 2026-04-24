export interface FilterState {
  query: string;
  selectedSorts: string[];
  startDate: string | null;
  endDate: string | null;
  exactDate: string | null;
}
