export type SpecRow = {label: string; value: string | null | undefined};

/**
 * Product characteristics table. Every row comes from real Shopify product
 * data — rows whose value is missing are dropped rather than shown empty or
 * filled with a placeholder, so this stays accurate across the whole
 * catalogue.
 */
export function ProductSpecs({rows}: {rows: SpecRow[]}) {
  const filled = rows.filter(
    (row): row is {label: string; value: string} =>
      typeof row.value === 'string' && row.value.trim().length > 0,
  );

  if (!filled.length) return null;

  return (
    <dl className="specs">
      {filled.map((row) => (
        <div className="specs__row" key={row.label}>
          <dt className="specs__label">{row.label}</dt>
          <dd className="specs__value">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
