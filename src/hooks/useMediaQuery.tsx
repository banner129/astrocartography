import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  // Start with false to match server-side rendering (avoid hydration mismatch)
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia(query);

    // Initial check
    setMatches(mediaQuery.matches);

    // Create a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener
    mediaQuery.addEventListener("change", handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  // Return false during SSR and initial render to avoid hydration mismatch
  if (!mounted) {
    return false;
  }

  return matches;
}
