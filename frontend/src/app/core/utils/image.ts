/**
 * Product cover images come from two sources:
 *  - Seeded covers live in the Angular app: /assets/images/products/<filename>
 *  - Uploaded covers are served by the API:   /uploads/products/<filename>
 * The database stores a bare filename (or an absolute URL), so resolve
 * relative filenames against the local assets folder and always fall back
 * to the placeholder graphic when a file is missing.
 */

export const PRODUCT_IMAGE_FALLBACK = '/assets/images/defaultProduct.png';

export function resolveProductImage(url?: string | null): string {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }
  return '/assets/images/products/' + url.replace(/^\.?\//, '');
}
