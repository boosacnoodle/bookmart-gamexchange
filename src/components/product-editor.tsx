import type { ConditionGrade, InventoryState, Product, ProductCategory, StockLocation } from "@prisma/client";
import { saveProduct } from "@/app/management-actions";
import { formatMoney } from "@/lib/format";

const categories: ProductCategory[] = ["BOOKS", "GAMES", "CONSOLES", "VINYL", "RARE_COLLECTIBLE", "MUSIC_FILM", "JEWELLERY_CURIOSITIES"];
const conditions: ConditionGrade[] = ["NEW_SEALED", "LIKE_NEW", "VERY_GOOD", "GOOD", "ACCEPTABLE", "FOR_PARTS_UNTESTED", "STAFF_REVIEWED_COLLECTIBLE"];
const states: InventoryState[] = ["DRAFT", "NEEDS_REVIEW", "READY", "PUBLISHED", "RESERVED", "SOLD", "ARCHIVED", "REJECTED"];

export function ProductEditor({ product, locations }: { product?: Product; locations: StockLocation[] }) {
  return (
    <form action={saveProduct} className="management-form">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label>Title<input name="title" defaultValue={product?.title} required /></label>
      <label>Category<select name="category" defaultValue={product?.category ?? "BOOKS"}>{categories.map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      <label>Subcategory<input name="subcategory" defaultValue={product?.subcategory ?? ""} required /></label>
      <label>Creator / author<input name="creator" defaultValue={product?.creator ?? ""} /></label>
      <label>Publisher / maker<input name="publisher" defaultValue={product?.publisher ?? ""} /></label>
      <label>Platform<input name="platform" defaultValue={product?.platform ?? ""} /></label>
      <label>Format<input name="format" defaultValue={product?.format ?? ""} /></label>
      <label>ISBN<input name="isbn" defaultValue={product?.isbn ?? ""} /></label>
      <label>EAN / UPC<input name="ean" defaultValue={product?.ean ?? ""} /></label>
      <label>Price<input name="priceMajor" type="number" min="0" step="0.01" defaultValue={product ? String(product.priceMinor / 100) : "0"} required /></label>
      <label>Condition<select name="conditionGrade" defaultValue={product?.conditionGrade ?? "GOOD"}>{conditions.map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      <label>Inventory state<select name="inventoryState" defaultValue={product?.inventoryState ?? "DRAFT"}>{states.map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      <label>Quantity<input name="quantity" type="number" min="0" defaultValue={product?.quantity ?? 1} required /></label>
      <label>Shelf location<input name="shelfLocation" defaultValue={product?.shelfLocation ?? ""} required /></label>
      <label>Stock location<select name="stockLocationId" defaultValue={product?.stockLocationId ?? ""}><option value="">Unassigned</option>{locations.map((location) => <option value={location.id} key={location.id}>{location.publicLabel}</option>)}</select></label>
      <label>Short description<textarea name="shortDescription" rows={3} defaultValue={product?.shortDescription ?? ""} required /></label>
      <label>Full description<textarea name="description" rows={5} defaultValue={product?.description ?? ""} required /></label>
      <label>Condition report<textarea name="conditionReport" rows={4} defaultValue={product?.conditionReport ?? ""} required /></label>
      <label>Included components<input name="included" defaultValue={product?.included.join(", ") ?? ""} /></label>
      <label>Missing components<input name="missing" defaultValue={product?.missing.join(", ") ?? ""} /></label>
      <label>Tested status<input name="testedStatus" defaultValue={product?.testedStatus ?? ""} /></label>
      <label>Upload image<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
      <label className="check"><input type="checkbox" name="isFeatured" value="true" defaultChecked={product?.isFeatured} /> Featured</label>
      <label className="check"><input type="checkbox" name="isStaffPick" value="true" defaultChecked={product?.isStaffPick} /> Staff pick</label>
      <label className="check"><input type="checkbox" name="isRare" value="true" defaultChecked={product?.isRare} /> Rare / collectible</label>
      <button className="button button-primary" type="submit">{product ? `Save ${formatMoney(product.priceMinor)} product` : "Create product"}</button>
    </form>
  );
}
