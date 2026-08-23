/**
 * Intrinsic sizes of the brand images, read from the files at build time by
 * scripts/generate-assets.mjs.
 *
 * Components ask for a rendered width and get the matching height back, so the
 * markup can never disagree with the artwork — which is what keeps CLS at zero
 * when the logo files are replaced.
 */
import manifest from './brand-manifest.json';

type BrandAsset = keyof typeof manifest;

/** Height that preserves the asset's aspect ratio at the given width. */
export function heightAt(asset: BrandAsset, width: number): number {
  const { width: w, height: h } = manifest[asset];
  return Math.round((width * h) / w);
}

/** Width that preserves the asset's aspect ratio at the given height. */
export function widthAt(asset: BrandAsset, height: number): number {
  const { width: w, height: h } = manifest[asset];
  return Math.round((height * w) / h);
}
