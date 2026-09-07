export interface UserPreferences {
  languages: string[];
  topics: string[];
  terms: string[];
}

const STORAGE_KEY = "repocentral:preferences";

export function getPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const prefs: UserPreferences = {
      languages: parsed.languages ?? [],
      topics: parsed.topics ?? [],
      terms: parsed.terms ?? [],
    };
    if (!prefs.languages.length && !prefs.topics.length && !prefs.terms.length) {
      return null;
    }
    return prefs;
  } catch {
    return null;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
