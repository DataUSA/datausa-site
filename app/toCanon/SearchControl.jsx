import React, { useState, useEffect, useRef, useId } from "react";
import PropTypes from "prop-types";
import { useSearchFetch } from "./hooks/useSearchFetch";
import clsx from "classnames";

/**
 * @typedef {Object} SearchResult
 * @property {string|number} [id] - The unique identifier of the result item. Used to build a fallback React key.
 * @property {string} [dimension] - The category or scope of the result item. Used to build a fallback React key.
 * @property {string} [key] - Explicit React key override for the list item element.
 * @property {string} name - The display text or title of the search result.
 * @property {Object} [any] - Dynamic payload fields returned from the API endpoint.
 */

/**
 * A modernized, accessible search component featuring asynchronous API-driven results,
 * automatic debouncing, optional global hotkey activation, and complete keyboard/scroll navigation.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string|boolean} [props.buttonLink=false] -
 * The base URL pathname used to redirect a user or link out to a dedicated results page.
 * If a string is provided, a "Search" submit button and an "All Results" anchor are rendered
 * appended with `?q=query`.
 * @param {string} [props.buttonText="Search"] -
 * The visible text content nested inside the layout action submit button.
 * @param {string} [props.className="search"] -
 * CSS class override applied directly onto the outermost container element.
 * @param {string} [props.defaultQuery=""] -
 * The initial query string used to populate the search field input on layout mount.
 * @param {string|boolean} [props.icon="search"] -
 * The BlueprintJS design utility icon class suffix string. Set to `false` to hide.
 * @param {React.ComponentType<{active: boolean, onClick: () => void}>|boolean} [props.inactiveComponent=false] -
 * - An optional toggle wrapper component injected left of the input field,
 * which receives the active dropdown state and a click handler to toggle focus.
 * @param {string} [props.placeholder="Search"] -
 * The fallback hint text displayed inside the empty search `<input>`.
 * @param {boolean} [props.enableGlobalShortcut=false] -
 * When true, initializes an active window listener that automatically steals
 * focus and targets the search input when the user presses the 'S' key on their
 * keyboard (bypassed if typing inside textareas or inputs).
 * @param {(res: SearchResult, Object) => React.ReactNode} [props.resultRender] -
 * Custom rendering callback function invoked for every individual match item
 * inside the list array. Receives the result object as its primary argument.
 * @param {boolean} [props.searchEmpty=false] -
 * If true, triggers an immediate remote API fetch network request for an empty
 * string query when the component initializes or changes.
 * @param {string|boolean} [props.apiUrl=false] -
 * The full target remote server endpoint path used to retrieve dynamic async
 * records. Appends `?q={query}` or `&q={query}` to the payload request context.
 * @param {function(string): void} [props.onQueryChange] -
 * Event hook callback executed immediately when the user changes or clears the
 * text value inside the input field.
 * @param {Object} [props.router] -
 * A decoupled history router navigation object layer (supporting `.push(href)` architecture),
 * replacing old legacy context dependencies. Falls back natively to `window.location.href`.
 * @returns {React.ReactElement} The rendered Search bar with inline scroll-to-view accessible popup dropdown results.
 */
export function SearchControl({
  buttonLink = false,
  buttonText = "Search",
  className = "search",
  defaultQuery = "",
  icon = "search",
  inactiveComponent: InactiveComponent = false,
  placeholder = "Search",
  enableGlobalShortcut = false,
  resultRender = (data) => <span>{data.name}</span>,
  searchEmpty = false,
  apiUrl = false,
  onQueryChange,
  router,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const uniqueComponentIdRef = useRef(`search-${Math.random().toString(36).slice(2, 9)}`);
  const uniqueComponentId = uniqueComponentIdRef.current;

  // Consume the new custom hook
  const {
    currentQuery, setCurrentQuery, searchResults, isLoading,
  } = useSearchFetch(apiUrl, defaultQuery, searchEmpty);

  // Reset keyboard highlights whenever results change or dropdown closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults, isDropdownOpen]);

  // Handle outside clicks and global window hotkeys
  useEffect(() => {
    const handleGlobalEvents = (event) => {
      if (event.type === "mousedown") {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
        return;
      }

      if (event.type === "keydown" && enableGlobalShortcut && !isDropdownOpen && event.key.toLowerCase() === "s") {
        const isTyping = ["input", "textarea"].includes(event.target.tagName.toLowerCase()) || event.target.className.includes("DraftEditor");
        if (!isTyping) {
          event.preventDefault();
          inputRef.current?.focus();
          setIsDropdownOpen(true);
        }
      }
    };

    document.addEventListener("mousedown", handleGlobalEvents);
    document.addEventListener("keydown", handleGlobalEvents);
    return () => {
      document.removeEventListener("mousedown", handleGlobalEvents);
      document.removeEventListener("keydown", handleGlobalEvents);
    };
  }, [isDropdownOpen, enableGlobalShortcut]);

  const adjustScroll = (index) => {
    const element = containerRef.current?.querySelectorAll("li.result")[index];
    element?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyboardNavigation = (event) => {
    if (!isDropdownOpen) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        inputRef.current?.blur();
        setIsDropdownOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = Math.min(prev + 1, searchResults.length - 1);
          adjustScroll(next);
          return next;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          adjustScroll(next);
          return next;
        });
        break;
      case "Enter":
        if (highlightedIndex > -1) {
          event.preventDefault();
          const targetItem = containerRef.current?.querySelectorAll("li.result")[highlightedIndex];
          const nestedLink = targetItem?.querySelector("a");

          if (nestedLink) {
            if (router?.push) router.push(nestedLink.getAttribute("href"));
            else window.location.href = nestedLink.getAttribute("href");
          } else {
            targetItem?.querySelector("*")?.click();
          }
          setIsDropdownOpen(false);
        }
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCurrentQuery(val);
    if (onQueryChange) onQueryChange(val);
    setIsDropdownOpen(true);
  };

  const handleClear = () => {
    setCurrentQuery("");
    if (onQueryChange) onQueryChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`${className} ${isDropdownOpen ? "active" : ""}`} id={uniqueComponentId}>
      <div className="bp3-control-group">
        {InactiveComponent && (
          <InactiveComponent
            active={isDropdownOpen}
            onClick={() => isDropdownOpen ? inputRef.current?.blur() : inputRef.current?.focus()}
          />
        )}
        <div className={`bp3-input-group bp3-fill ${isDropdownOpen ? "active" : ""}`}>
          {icon && <span className={`bp3-icon bp3-icon-${icon}`}></span>}
          <input
            ref={inputRef}
            type="text"
            className="bp3-input"
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyboardNavigation}
            placeholder={placeholder}
            value={currentQuery}
          />
          {isDropdownOpen && currentQuery.length > 0 && (
            <span
              className="bp3-icon bp3-icon-trash"
              role="button"
              tabIndex={0}
              aria-label="Clear search"
              style={{ cursor: "pointer" }}
              onClick={handleClear}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClear()}
            />
          )}
          {buttonLink && (
            <a href={`${buttonLink}?q={currentQuery}`} className="bp3-button">{buttonText}</a>
          )}
        </div>
      </div>

      <ul className={clsx("results", {active: isDropdownOpen})}>
        {isLoading && <li className="no-results">Loading…</li>}
        {!isLoading && !searchResults.length && isDropdownOpen && currentQuery.trim().length > 0 && (
          <li className="no-results">No Results Found</li>
        )}
        {!isLoading && searchResults.map((result, index) => (
          <li
            key={result.key || `${result.dimension}-${result.id}`}
            className={`result ${index === highlightedIndex ? "highlighted" : ""}`}
            onClick={() => setIsDropdownOpen(false)}
          >
            {resultRender(result, { buttonLink, buttonText, className, placeholder })}
          </li>
        ))}
        {searchResults.length > 0 && buttonLink && (
          <a className="all-results bp3-button bp3-fill" href={`${buttonLink}?q=${currentQuery}`}>
            Show All Results
          </a>
        )}
      </ul>
    </div>
  );
};
