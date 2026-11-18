import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getSiteUrl, publicProductPath } from "@/lib/site-url";

// Cache the query with the same tags that publishing, archiving, deleting and
// renaming products invalidate. Do not leave a separately cached XML response.
export const dynamic = "force-dynamic";
const getPublishedProducts = unstable_cache(
  () => db.select({ slug: products.slug, type: products.type, updatedAt: products.updatedAt })
    .from(products).where(eq(products.isPublished, true)),
  ["sitemap-products-v1"], { tags: ["coffee-catalog", "equipment-catalog"], revalidate: 300 },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const rows = await getPublishedProducts();
  return [
    ...["/", "/catalog", "/equipment", "/b2b", "/academy", "/academy/author", "/academy/sca", "/contacts", "/why"].map((path) => ({ url: new URL(path, origin).href })),
    ...rows.map((product) => ({ url: new URL(publicProductPath(product.type, product.slug), origin).href, lastModified: product.updatedAt })),
  ];
}
