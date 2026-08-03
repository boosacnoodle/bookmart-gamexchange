import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { db } from "@/lib/db";

export default async function QrLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  const svg = await QRCode.toString(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/staff/inventory/${product.id}`, { type: "svg", margin: 1, width: 160 });
  return (
    <section className="label-page">
      <div className="stock-label-print">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <h1>{product.sku}</h1>
        <p>{product.title}</p>
        <p>{product.shelfLocation}</p>
      </div>
      <PrintButton />
    </section>
  );
}
