import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/product-editor";
import { db } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, locations] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.stockLocation.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!product) notFound();
  return <><div className="management-head"><h1>Edit product</h1></div><ProductEditor product={product} locations={locations} /></>;
}
