import {useNavigate} from 'react-router';
import type {SortKeyOption} from '~/routes/collections.$handle';
import {ChevronIcon} from '~/components/Icons';

const SORT_LABELS: Record<SortKeyOption, string> = {
  newest: 'Nouveautés',
  'price-asc': 'Prix croissant',
  'price-desc': 'Prix décroissant',
  'title-asc': 'Alphabétique A–Z',
};

export function CollectionSortFilter({
  sort,
  available,
  searchParams,
}: {
  sort: SortKeyOption;
  available: boolean;
  searchParams: URLSearchParams;
}) {
  const navigate = useNavigate();

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    next.delete('direction');
    next.delete('cursor');
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    void navigate(`?${next.toString()}`, {preventScrollReset: true});
  }

  const hasActiveFilters = available;

  return (
    <div className="collection-toolbar">
      <label className="collection-toolbar__checkbox">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => updateParam('available', e.target.checked ? '1' : null)}
        />
        En stock uniquement
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          className="link collection-toolbar__clear"
          onClick={() => updateParam('available', null)}
        >
          Effacer les filtres
        </button>
      )}

      <div className="collection-toolbar__sort">
        <label htmlFor="collection-sort" className="sr-only">
          Trier
        </label>
        <div className="collection-toolbar__select-wrap">
          <select
            id="collection-sort"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronIcon className="collection-toolbar__select-icon" />
        </div>
      </div>
    </div>
  );
}
