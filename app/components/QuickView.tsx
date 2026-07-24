import {createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {CloseIcon} from '~/components/Icons';
import {getProductVideo} from '~/lib/media';
import {useVariantUrl} from '~/lib/variants';

type QuickViewContextValue = {
  product: HomeProductFragment | null;
  open: (product: HomeProductFragment) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({children}: {children: ReactNode}) {
  const [product, setProduct] = useState<HomeProductFragment | null>(null);
  return (
    <QuickViewContext.Provider value={{product, open: setProduct, close: () => setProduct(null)}}>
      {children}
      <QuickViewModal />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error('useQuickView must be used within QuickViewProvider');
  return ctx;
}

function QuickViewModal() {
  const {product, close} = useQuickView();
  const id = useId();
  const expanded = Boolean(product);

  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    document.addEventListener('keydown', (event) => event.key === 'Escape' && close(), {signal: controller.signal});
    return () => controller.abort();
  }, [close, expanded]);

  return (
    <div className={`overlay quickview-overlay ${expanded ? 'expanded' : ''}`} aria-modal aria-hidden={!expanded} role="dialog" aria-labelledby={id}>
      <button className="close-outside" onClick={close} aria-label="Fermer" tabIndex={expanded ? 0 : -1} />
      {product && <QuickViewContent product={product} titleId={id} onClose={close} />}
    </div>
  );
}

function QuickViewContent({
  product,
  titleId,
  onClose,
}: {
  product: HomeProductFragment;
  titleId: string;
  onClose: () => void;
}) {
  const productUrl = useVariantUrl(product.handle);
  const video = getProductVideo(product);
  const optionsWithChoice = product.options.filter((o) => o.optionValues.length > 1);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(optionsWithChoice.map((o) => [o.name, o.optionValues[0]?.name ?? ''])),
  );

  const variant = useMemo(() => {
    return (
      product.variants.nodes.find((v) =>
        v.selectedOptions.every((opt) => (selected[opt.name] ?? opt.value) === opt.value),
      ) ?? product.variants.nodes[0]
    );
  }, [product.variants.nodes, selected]);

  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);
  const available = variant?.availableForSale ?? product.availableForSale;

  return (
    <div className="quickview">
      <button className="quickview__close" onClick={onClose} aria-label="Fermer">
        <CloseIcon />
      </button>

      <div className="quickview__media">
        {video ? (
          <video
            className="quickview__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.previewImage?.url}
          >
            {video.sources.map((source) => (
              <source key={source.url} src={source.url} type={source.mimeType} />
            ))}
          </video>
        ) : product.featuredImage ? (
          <Image data={product.featuredImage} alt={product.featuredImage.altText || product.title} aspectRatio="1/1" sizes="(min-width: 40em) 50vw, 100vw" />
        ) : null}
      </div>

      <div className="quickview__info">
        <h3 id={titleId} className="quickview__title">
          {product.title}
        </h3>
        <div className="quickview__price">
          <Money data={price} />
          {onSale && compareAt && (
            <s>
              <Money data={compareAt} />
            </s>
          )}
        </div>

        {optionsWithChoice.map((option) => (
          <div className="product-option" key={option.name}>
            <p className="pdp__option-label">{option.name.toLowerCase()}</p>
            <div className="option-grid">
              {option.optionValues.map((value) => (
                <button
                  key={value.name}
                  type="button"
                  className="option-btn"
                  data-selected={selected[option.name] === value.name}
                  onClick={() => setSelected((prev) => ({...prev, [option.name]: value.name}))}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="quickview__actions">
          <AddToCartButton
            className="btn btn--full btn--outline"
            disabled={!variant || !available}
            onClick={onClose}
            lines={variant ? [{merchandiseId: variant.id, quantity: 1}] : []}
          >
            {available ? 'ajouter au panier' : 'épuisé'}
          </AddToCartButton>
          <Link to={productUrl} onClick={onClose} className="quickview__link">
            voir la fiche produit
          </Link>
        </div>
      </div>
    </div>
  );
}
