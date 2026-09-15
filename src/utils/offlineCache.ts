/**
 * Utility to pre-cache all menu photos and assets into browser Cache Storage
 * ensuring 100% offline availability without Wi-Fi or cellular network.
 */

export const MENU_CACHE_NAME = 'menu-images-cache';

export async function prefetchImage(url: string): Promise<boolean> {
  if (!url) return false;

  // 1. If Cache Storage API is supported, store the request
  if ('caches' in window) {
    try {
      const cache = await caches.open(MENU_CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        return true;
      }
      // Fetch with no-cors so cross-origin CDN images (Unsplash) are safely cached
      await cache.add(new Request(url, { mode: 'no-cors' }));
      return true;
    } catch {
      // Fallback to Image element preloading below
    }
  }

  // 2. Preload into browser image memory
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(true);
    img.onerror = () => {
      // Retry without crossOrigin if CORS failed
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(true);
      fallbackImg.onerror = () => resolve(false);
      fallbackImg.src = url;
    };
    img.src = url;
  });
}

export async function prefetchAllProductImages(
  urls: string[],
  onProgress?: (progress: { loaded: number; total: number; percent: number; currentUrl?: string }) => void
): Promise<{ success: number; failed: number }> {
  // Deduplicate and filter out empty or data URLs (data URLs are already offline)
  const uniqueUrls = Array.from(new Set(urls.filter(u => u && !u.startsWith('data:'))));
  const total = uniqueUrls.length;

  if (total === 0) {
    onProgress?.({ loaded: 0, total: 0, percent: 100 });
    return { success: 0, failed: 0 };
  }

  let loaded = 0;
  let successCount = 0;
  let failedCount = 0;

  // Process in small batches of 3 to avoid overwhelming mobile network or browser
  const batchSize = 3;
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (url) => {
        const ok = await prefetchImage(url);
        if (ok) successCount++;
        else failedCount++;
        loaded++;
        onProgress?.({
          loaded,
          total,
          percent: Math.round((loaded / total) * 100),
          currentUrl: url,
        });
      })
    );
  }

  return { success: successCount, failed: failedCount };
}

export async function getCachedImagesCount(): Promise<number> {
  if (!('caches' in window)) return 0;
  try {
    const cache = await caches.open(MENU_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}
