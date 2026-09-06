"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { INTEREST_LANGUAGES, INTEREST_TOPICS } from "@/lib/github/interests";
import { getPreferences, savePreferences } from "@/lib/preferences";

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        selected
          ? "border-accent bg-accent/20 text-accent"
          : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    if (prefs) {
      setLanguages(prefs.languages);
      setTopics(prefs.topics);
    }
  }, []);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
    setSaved(false);
  }

  function handleSave() {
    savePreferences({ languages, topics });
    setSaved(true);
    router.push("/");
  }

  const hasSelection = languages.length > 0 || topics.length > 0;

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-8">
        <h1 className="text-2xl font-semibold text-white">
          Set up your interests
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Pick the languages and topics you care about. We&apos;ll use them to
          build a personalized{" "}
          <span className="text-accent">Favorites</span> row on your home
          page.
        </p>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTEREST_LANGUAGES.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected={languages.includes(lang)}
                onToggle={() => toggle(languages, setLanguages, lang)}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">
            Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TOPICS.map((topic) => (
              <Chip
                key={topic.id}
                label={topic.label}
                selected={topics.includes(topic.id)}
                onToggle={() => toggle(topics, setTopics, topic.id)}
              />
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            disabled={!hasSelection}
            onClick={handleSave}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save & view favorites
          </button>
          {!hasSelection && (
            <p className="text-xs text-white/40">
              Select at least one language or topic to continue.
            </p>
          )}
          {saved && <p className="text-xs text-accent">Saved!</p>}
        </div>
      </main>
    </>
  );
}
