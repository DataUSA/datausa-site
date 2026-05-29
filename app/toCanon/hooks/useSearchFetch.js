import { useState, useEffect } from "react";
import axios from "axios";

export function useSearchFetch(apiUrl, defaultQuery, searchEmpty) {
  const [currentQuery, setCurrentQuery] = useState(defaultQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If query is empty and searchEmpty flag is false, reset immediately without fetching
    if (!searchEmpty && currentQuery.trim() === "") {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    if (!apiUrl) return;

    setIsLoading(true);
    const separator = apiUrl.includes("?") ? "&" : "?";

    // Standard React debounce pattern: delays the network request by 250ms
    const delayDebounce = setTimeout(() => {
      axios
        .get(`${apiUrl}${separator}q=${encodeURIComponent(currentQuery)}`)
        .then((res) => {
          setSearchResults(Array.isArray(res.data.results) ? res.data.results : []);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsLoading(false));
    }, 250);

    // If currentQuery changes before 250ms, this cleanup runs, canceling the previous timer.
    return () => clearTimeout(delayDebounce);
  }, [currentQuery, apiUrl, searchEmpty]);

  return {
    currentQuery,
    setCurrentQuery,
    searchResults,
    isLoading,
  };
};
