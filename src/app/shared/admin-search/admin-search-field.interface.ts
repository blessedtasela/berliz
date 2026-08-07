/**
 * Describes one searchable field for `<app-admin-search>`: the option shown in the
 * criteria dropdown (value/label) plus a getter that pulls a comparable string out
 * of a row of type T. Keep accessors defensive (optional chaining, `|| ''`) since
 * admin data is loaded async and can contain partial/legacy rows.
 */
export interface AdminSearchField<T = any> {
  value: string;
  label: string;
  accessor: (item: T) => string;
}
