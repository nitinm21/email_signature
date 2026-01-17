"use client";

import { useEffect, useState } from "react";
import { Country, countries, getDefaultCountry } from "@/lib/countries";

const COUNTRY_CACHE_KEY = "detected-country-code";

type IpApiResponse = {
  countryCode?: string;
  country_code?: string; // Some APIs use snake_case
};

export function useCountryDetection() {
  const [country, setCountry] = useState<Country>(getDefaultCountry());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectCountry = async () => {
      // Check cache first
      const cached = localStorage.getItem(COUNTRY_CACHE_KEY);
      if (cached) {
        const found = countries.find((c) => c.code === cached);
        if (found) {
          setCountry(found);
          setIsLoading(false);
          return;
        }
      }

      try {
        // Using ip-api.com (free, no API key required, 45 requests/minute limit)
        const response = await fetch("http://ip-api.com/json/?fields=countryCode");

        if (!response.ok) {
          throw new Error("Failed to detect location");
        }

        const data: IpApiResponse = await response.json();
        const countryCode = data.countryCode || data.country_code;

        if (countryCode) {
          const found = countries.find((c) => c.code === countryCode);
          if (found) {
            setCountry(found);
            localStorage.setItem(COUNTRY_CACHE_KEY, countryCode);
          }
        }
      } catch (err) {
        // Fallback: try ipapi.co as backup (free tier available)
        try {
          const response = await fetch("https://ipapi.co/country_code/");
          if (response.ok) {
            const countryCode = await response.text();
            const found = countries.find((c) => c.code === countryCode.trim());
            if (found) {
              setCountry(found);
              localStorage.setItem(COUNTRY_CACHE_KEY, countryCode.trim());
            }
          }
        } catch {
          setError("Could not detect location");
        }
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  return { country, isLoading, error, setCountry };
}
