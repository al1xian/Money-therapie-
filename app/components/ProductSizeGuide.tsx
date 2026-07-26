import {useId, useState} from 'react';
import {ChevronDownIcon} from '~/components/Icons';

export type SizeEntry = {name: string; available: boolean};

/**
 * Size guide disclosure shown next to the size selector.
 *
 * It lists the sizes this product actually has in Shopify (with their live
 * availability) and the brand's fit guidance. It deliberately publishes no
 * body measurements: those aren't in the Shopify data, and inventing
 * centimetre values would push customers toward the wrong size. Add the real
 * measurements to the product data and they can be surfaced here.
 */
export function ProductSizeGuide({sizes}: {sizes: SizeEntry[]}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!sizes.length) return null;

  return (
    <div className="size-guide">
      <button
        type="button"
        className="size-guide__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        guide des tailles
        <ChevronDownIcon className="size-guide__chevron" />
      </button>

      {open && (
        <div className="size-guide__panel" id={panelId}>
          <ul className="size-guide__list">
            {sizes.map((size) => (
              <li key={size.name} className="size-guide__row">
                <span className="size-guide__size">{size.name.toLowerCase()}</span>
                <span
                  className={`size-guide__stock ${
                    size.available ? 'size-guide__stock--in' : 'size-guide__stock--out'
                  }`}
                >
                  {size.available ? 'disponible' : 'épuisé'}
                </span>
              </li>
            ))}
          </ul>
          <p className="size-guide__note">
            nos pièces taillent normalement. en cas d&rsquo;hésitation entre
            deux tailles, prenez la taille au-dessus pour un porté plus ample.
            un doute&nbsp;? <a href="/contact">écrivez-nous</a> avant de
            commander, on vous répond sous 24&nbsp;h.
          </p>
        </div>
      )}
    </div>
  );
}
