"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { conditionLabel } from "@/lib/format";

export function SearchFilters({ conditions, platforms }: { conditions: string[]; platforms: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(formData: FormData) {
    const next = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (String(value)) next.set(key, String(value));
    }
    startTransition(() => router.push(`/search?${next.toString()}`));
  }

  function updateFromForm(form: HTMLFormElement) {
    update(new FormData(form));
  }

  return (
    <form action={update} className="filter-bar premium-search" onChange={(event) => updateFromForm(event.currentTarget)}>
      <label className="search-box premium-search-box">
        <Search size={18} />
        <input name="q" placeholder="Title, author, ISBN, platform..." defaultValue={params.get("q") ?? ""} />
      </label>
      <select name="condition" defaultValue={params.get("condition") ?? ""} aria-label="Condition">
        <option value="">Any condition</option>
        {conditions.map((condition) => <option value={condition} key={condition}>{conditionLabel(condition as never)}</option>)}
      </select>
      <select name="platform" defaultValue={params.get("platform") ?? ""} aria-label="Platform">
        <option value="">Any platform</option>
        {platforms.map((platform) => <option value={platform} key={platform}>{platform}</option>)}
      </select>
      <select name="maxPrice" defaultValue={params.get("maxPrice") ?? ""} aria-label="Maximum price">
        <option value="">Any price</option>
        <option value="10">Under EUR 10</option>
        <option value="25">Under EUR 25</option>
        <option value="75">Under EUR 75</option>
      </select>
      <button className="button button-primary" type="submit">{pending ? "Searching..." : "Search"}</button>
    </form>
  );
}
