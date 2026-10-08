/**
 * The provider profile pages exist in two skins: the public marketing site is
 * permanently dark (zinc), the signed-in dashboard follows the light/dark
 * toggle (gray + `dark:`). The shared profile cards take a `theme` input and
 * look their classes up here, so one component serves both without a fork.
 * (The class strings live in a .ts file on purpose: Tailwind scans src/**\/*.ts.)
 */
export type ProfileTheme = 'dark' | 'light';

export interface ProfileThemeClasses {
  card: string;
  tile: string;
  heading: string;
  body: string;
  muted: string;
  eyebrow: string;
  accent: string;
  divider: string;
  chip: string;
  ghostButton: string;
}

const DARK: ProfileThemeClasses = {
  card: 'bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6',
  tile: 'bg-zinc-950 border border-zinc-800 rounded-xl',
  heading: 'text-white',
  body: 'text-zinc-300',
  muted: 'text-zinc-500',
  eyebrow: 'text-zinc-500',
  accent: 'text-red-500',
  divider: 'border-zinc-800',
  chip: 'bg-zinc-800 border border-zinc-700 text-zinc-300',
  ghostButton: 'border border-zinc-700 text-zinc-200 hover:border-red-600 hover:text-white',
};

const LIGHT: ProfileThemeClasses = {
  card: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5',
  tile: 'bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl',
  heading: 'text-gray-900 dark:text-gray-100',
  body: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-400 dark:text-gray-500',
  eyebrow: 'text-gray-400 dark:text-gray-500',
  accent: 'text-red-600',
  divider: 'border-gray-200 dark:border-gray-800',
  chip: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  ghostButton: 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600',
};

export function profileTheme(theme: ProfileTheme): ProfileThemeClasses {
  return theme === 'dark' ? DARK : LIGHT;
}
