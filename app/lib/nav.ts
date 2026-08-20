import type {TranslationKey} from './i18n/dictionary';

/**
 * Turns the flat list of Shopify collections into the two-level menu.
 *
 * The menu used to list every collection side by side — eleven entries by the
 * time the drops piled up, which is a wall rather than a menu. They now sit in
 * two groups: the permanent categories, then the drops.
 *
 * A collection is a drop when its name says so. That is data-driven on
 * purpose: a new "spring drop" created in Shopify lands in the right group
 * without anyone editing this file.
 */

export type NavCollection = {
  id: string;
  title: string;
  handle: string;
};

export type NavGroup = {
  /** Stable key for the accordion / dropdown state. */
  id: string;
  /** Dictionary key — the label itself is resolved at render time. */
  labelKey: TranslationKey;
  collections: NavCollection[];
};

/** Normalised for comparison: "T-Shirts" and "tshirt" are the same thing. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** True for "summer drop", "win drop", "all in drop", and whatever comes next. */
function isDrop(collection: NavCollection): boolean {
  return /\bdrops?\b/.test(collection.title.toLowerCase());
}

/**
 * The order the basics are asked to appear in. Anything not named here keeps
 * Shopify's own order, after these — so adding a collection in Shopify shows
 * it in the menu without a code change, it just goes at the end.
 */
const BASICS_ORDER = [
  'hoodie',
  'hoodies',
  'jogging',
  'joggings',
  'jeans',
  'tshirt',
  'tshirts',
  'short',
  'shorts',
];

/** WIN drop leads; the rest follow in Shopify's order. */
const DROPS_ORDER = ['windrop'];

function rank(collection: NavCollection, order: string[]): number {
  const index = order.indexOf(normalize(collection.title));
  // Unlisted collections sort after every listed one, keeping their own order.
  return index === -1 ? order.length : index;
}

function sortBy(collections: NavCollection[], order: string[]): NavCollection[] {
  return collections
    .map((collection, index) => ({collection, index}))
    .sort((a, b) => {
      const byRank = rank(a.collection, order) - rank(b.collection, order);
      return byRank !== 0 ? byRank : a.index - b.index;
    })
    .map(({collection}) => collection);
}

/**
 * Builds the menu. Empty groups are dropped, so a store with no drops yet
 * doesn't show an empty "our drops" heading.
 */
export function buildNavGroups(collections: NavCollection[]): NavGroup[] {
  const drops = collections.filter(isDrop);
  const basics = collections.filter((collection) => !isDrop(collection));

  return [
    {
      id: 'basics',
      labelKey: 'nav.basics' as const,
      collections: sortBy(basics, BASICS_ORDER),
    },
    {
      id: 'drops',
      labelKey: 'nav.drops' as const,
      collections: sortBy(drops, DROPS_ORDER),
    },
  ].filter((group) => group.collections.length > 0);
}

/**
 * The service pages that close the menu, in the order asked for: tracking
 * first, then the terms.
 */
export const NAV_SERVICE_LINKS: Array<{labelKey: TranslationKey; to: string}> = [
  {labelKey: 'nav.track', to: '/order-tracking'},
  {labelKey: 'nav.conditions', to: '/legal/terms'},
];
