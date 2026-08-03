import { ProductEditor } from "@/components/product-editor";
import { db } from "@/lib/db";

export const metadata = { title: "Create Product" };

export default async function NewProductPage() {
  const locations = await db.stockLocation.findMany({ orderBy: { name: "asc" } });
  return <><div className="management-head"><h1>Create product</h1></div><ProductEditor locations={locations} /></>;
}
