import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/AddToCartButton';
import {CloseIcon} from '~/components/Icons';
import {useAside} from '~/components/Aside';

/**
 * Minimal structural shape a product must satisfy to be shown in quick view.
 * Any grid fragment that includes options + variants is compatible.
 */
export type QuickViewProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {minVariantPrice: MoneyV2};
  compareAtPriceRange?: {minVariantPrice: MoneyV2} | null;
  options?: Array<{name: string; optionValues: Array<{name: string}>}>;
  variants?: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      selectedOptions: Array<{name: string; value: string}>;
      price: MoneyV2;
      compareAtPrice?: MoneyV2 | null;
    }>;
  };
};

type QuickViewContextValue = {
  product: QuickViewProduct | null;
  open: (product: QuickViewProduct) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({children}: {children: ReactNode}) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  return (
    <QuickViewContext.Provider
      value={{product, open: setProduct, close: () => setProduct(null)}}
    >
      {children}
      <QuickViewModal />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error('useQuickView must be used within a QuickViewProvider');
  return ctx;
}

function isDefaultValue(value: string) {
  return value.trim().toLowerCase() === 'default title';
}

function QuickViewModal() {
  const {product, close} = useQuickView();
  const {open: openAside} = useAside();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    if (!product) return;
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => e.key === 'Escape' && close(),
      {signal: controller.signal},
    );
    return () => controller.abort();
  }, [product, close]);

  const singleOption =
    product?.options && product.options.length === 1 ? product.options[0] : null;
  const values = singleOption?.optionValues.map((v) => v.name) ?? [];
  const isSizeless = values.length === 0 || (values.length === 1 && isDefaultValue(values[0]));

  const variants = product?.variants?.nodes ?? [];
  const selectedVariant = isSizeless
    ? variants.find((v) => v.availableForSale) ?? variants[0]
    : selected
      ? variants.find((v) =>
          v.selectedOptions.some(
            (o) => o.name === singleOption?.name && o.value === selected,
          ),
        )
      : undefined;

  const price = product?.priceRange.minVariantPrice;
  const compareAt = product?.compareAtPriceRange?.minVariantPrice;
  const onSale =
    price && compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <div
      className={`quickview-overlay ${product ? 'quickview-overlay--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu rapide"
    >
      <button
        type="button"
        className="quickview-backdrop"
        aria-label="Fermer"
        tabIndex={product ? 0 : -1}
        onClick={close}
      />
      {product && (
        <div className="quickview">
          <div className="quickview__media">
            {product.featuredImage && (
              <Image data={product.featuredImage} alt={product.title} sizes="380px" />
            )}
          </div>
          <div className="quickview__body">
            <button className="quickview__close" onClick={close} aria-label="Fermer">
              <CloseIcon />
            </button>
            <h3 className="quickview__title">{product.title}</h3>
            {price && (
              <div className="quickview__price">
                <Money data={price} />
                {onSale && compareAt && (
                  <s>
                    <Money data={compareAt} />
                  </s>
                )}
              </div>
            )}

            {!isSizeless && singleOption && (
              <>
                <p className="pdp__option-label">{singleOption.name.toLowerCase()}</p>
                <div className="option-grid">
                  {singleOption.optionValues.map((value) => {
                    const variant = variants.find((v) =>
                      v.selectedOptions.some(
                        (o) => o.name === singleOption.name && o.value === value.name,
                      ),
                    );
                    const available = variant?.availableForSale ?? false;
                    return (
                      <button
                        key={value.name}
                        type="button"
                        className="option-btn"
                        data-selected={selected === value.name}
                        data-unavailable={!available}
                        disabled={!variant}
                        onClick={() => setSelected(value.name)}
                      >
                        {value.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <AddToCartButton
              disabled={!selectedVariant || !selectedVariant.availableForSale}
              onClick={() => {
                close();
                openAside('cart');
              }}
              lines={
                selectedVariant
                  ? [{merchandiseId: selectedVariant.id, quantity: 1}]
                  : []
              }
            >
              {isSizeless
                ? selectedVariant?.availableForSale
                  ? 'ajouter au panier'
                  : 'épuisé'
                : selected
                  ? selectedVariant?.availableForSale
                    ? 'ajouter au panier'
                    : 'épuisé'
                  : 'choisir une taille'}
            </AddToCartButton>

            <Link to={`/products/${product.handle}`} onClick={close} className="quickview__link">
              voir le produit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
