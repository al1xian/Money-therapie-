import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';

/** Renders the variant option selectors only (add-to-cart lives in the PDP). */
export function ProductForm({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  const navigate = useNavigate();

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-option" key={option.name}>
            <p className="pdp__option-label">{option.name.toLowerCase()}</p>
            <div className="option-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const content = (
                  <ProductOptionSwatch swatch={swatch} name={name} />
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="option-btn"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      data-selected={selected}
                      data-unavailable={!available}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className="option-btn"
                    key={option.name + name}
                    data-selected={selected}
                    data-unavailable={!available}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <span
      aria-label={name}
      className="option-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={name} />}
    </span>
  );
}
