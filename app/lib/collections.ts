/**
 * Collections volontairement absentes de la page d'accueil : elles restent
 * accessibles (header, page /collections, vitrine des pages produit), mais
 * ne s'affichent pas dans le carrousel de l'accueil.
 *
 * Le filtre porte sur le handle ET sur le titre normalisé, pour rester
 * efficace même si le handle Shopify diffère (« summer-drop », « summerdrop »,
 * un titre renommé, etc.).
 */
const HIDDEN_FROM_HOME = ['summer drop', 'all in drop'];

/** « SUMMER DROP » / « summer-drop » → « summer drop ». */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** True quand la collection ne doit pas apparaître sur la page d'accueil. */
export function isHiddenFromHome(collection: {
  handle: string;
  title: string;
}): boolean {
  const handle = normalize(collection.handle);
  const title = normalize(collection.title);
  return HIDDEN_FROM_HOME.some((name) => name === handle || name === title);
}

/** Retire de la liste les collections masquées sur la page d'accueil. */
export function withoutHomeHiddenCollections<
  T extends {handle: string; title: string},
>(collections: T[]): T[] {
  return collections.filter((collection) => !isHiddenFromHome(collection));
}
