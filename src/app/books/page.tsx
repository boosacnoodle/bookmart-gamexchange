import { CategoryPage } from "@/components/category-page";

export const metadata = { title: "Books" };

export default function BooksPage() {
  return <CategoryPage slug="books" />;
}
