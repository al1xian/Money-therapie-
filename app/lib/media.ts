type MediaNode = {
  mediaContentType: string;
  id?: string;
  previewImage?: {url: string; altText?: string | null} | null;
  sources?: {url: string; mimeType: string; format: string}[];
};

export type ProductVideo = {
  sources: {url: string; mimeType: string; format: string}[];
  previewImage: {url: string; altText?: string | null} | null;
};

/** First playable Shopify video attached to a product, if any. */
export function getProductVideo(product: {media?: {nodes: MediaNode[]}}): ProductVideo | null {
  const node = product.media?.nodes?.find((m) => m.mediaContentType === 'VIDEO' && (m.sources?.length ?? 0) > 0);
  if (!node?.sources?.length) return null;
  return {sources: node.sources, previewImage: node.previewImage ?? null};
}
