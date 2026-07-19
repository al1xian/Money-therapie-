import {Image} from '@shopify/hydrogen';
import type {ProductVariantFragment} from 'storefrontapi.generated';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export function ProductGallery({
  images,
  selectedImage,
}: {
  images: GalleryImage[];
  selectedImage?: ProductVariantFragment['image'];
}) {
  if (images.length === 0) {
    return <div className="product-gallery product-gallery--empty" />;
  }

  // Show the selected variant's image first when it differs from the default order.
  const ordered = selectedImage
    ? [selectedImage, ...images.filter((img) => img.id !== selectedImage.id)]
    : images;

  const [main, ...rest] = ordered;

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <Image
          data={main}
          alt={main.altText || 'Product image'}
          aspectRatio="4/5"
          sizes="(min-width: 64em) 60vw, 100vw"
          loading="eager"
        />
      </div>
      {rest.length > 0 && (
        <div className="product-gallery__grid">
          {rest.map((image) => (
            <div className="product-gallery__grid-item" key={image.id}>
              <Image
                data={image}
                alt={image.altText || 'Product image'}
                aspectRatio="4/5"
                sizes="(min-width: 64em) 30vw, 50vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
