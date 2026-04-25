"use client";

import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from "react";

const SEARCH_URL_DEBOUNCE_MS = 250;

export function useDebouncedQuerySearch({
  search,
  onSearchCommit,
}: {
  search: string;
  onSearchCommit: (search: string) => void;
}) {
  const [searchInput, setSearchInput] = useState(search);
  const deferredSearch = useDeferredValue(searchInput);
  const commitSearch = useEffectEvent((nextSearch: string) => {
    onSearchCommit(nextSearch);
  });

  useEffect(() => {
    if (search !== searchInput) {
      setSearchInput(search);
    }
  }, [search, searchInput]);

  useEffect(() => {
    if (searchInput === search) return;

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        commitSearch(searchInput || "");
      });
    }, SEARCH_URL_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [commitSearch, search, searchInput]);

  return {
    deferredSearch,
    searchInput,
    setSearchInput,
  };
}
