/**
 * Every gender picker in the app (signup, signup modal, settings, admin
 * edit-user modals) renders from this single list, so adding or wording an
 * option only ever needs to happen in one place. The backend stores
 * `User.gender` as free text with no enum/column constraint, so this list
 * is purely a frontend concern.
 */
export const GENDER_OPTIONS: string[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
