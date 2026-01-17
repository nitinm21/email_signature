"use client";

import { useEffect, useRef, useState } from "react";
import { Country, countries } from "@/lib/countries";

type CountryCodeSelectorProps = {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  isLoading?: boolean;
};

const ChevronIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default function CountryCodeSelector({
  selectedCountry,
  onSelect,
  isLoading = false,
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = search
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="country-selector" ref={containerRef}>
      <button
        type="button"
        className="country-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="country-loading">...</span>
        ) : (
          <>
            <span className="country-flag">{selectedCountry.flag}</span>
            <span className="country-dial-code">{selectedCountry.dialCode}</span>
            <span className="country-chevron">{ChevronIcon}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="country-dropdown" role="listbox">
          <div className="country-search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="country-search"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search countries"
            />
          </div>
          <div className="country-list">
            {filteredCountries.length === 0 ? (
              <div className="country-no-results">No countries found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`country-option ${country.code === selectedCountry.code ? "selected" : ""}`}
                  onClick={() => handleSelect(country)}
                  role="option"
                  aria-selected={country.code === selectedCountry.code}
                >
                  <span className="country-flag">{country.flag}</span>
                  <span className="country-name">{country.name}</span>
                  <span className="country-dial-code">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
