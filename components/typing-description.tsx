"use client";

import { useEffect, useState } from "react";

const description =
  "Class schedules, attendance, student records and school fees together in one clear, connected workspace.";
const descriptionCharacters = Array.from(description);

export default function TypingDescription() {
  const [characterCount, setCharacterCount] = useState(0);
  const [direction, setDirection] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharacterCount(descriptionCharacters.length);
      return;
    }

    const isAtPausePoint =
      (direction === "typing" && characterCount === descriptionCharacters.length) ||
      (direction === "deleting" && characterCount === 0);
    const timer = window.setTimeout(() => {
      if (direction === "typing") {
        if (characterCount === descriptionCharacters.length) {
          setDirection("deleting");
        } else {
          setCharacterCount((count) => count + 1);
        }
      } else if (characterCount === 0) {
        setDirection("typing");
      } else {
        setCharacterCount((count) => count - 1);
      }
    }, isAtPausePoint ? 700 : 45);

    return () => window.clearTimeout(timer);
  }, [characterCount, direction]);

  const visibleText = descriptionCharacters.slice(0, characterCount).join("");

  return (
    <div className="mt-7 max-w-[28rem]">
      <p className="grid text-[clamp(1rem,1.4vw,1.125rem)] leading-[1.65] text-[#a3a3aa]">
        <span className="sr-only">{description}</span>
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {description}
        </span>
        <span aria-hidden="true" className="col-start-1 row-start-1">
          {visibleText}
          {characterCount < descriptionCharacters.length && (
            <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[0.12em] bg-[#ff873e]" />
          )}
        </span>
      </p>
    </div>
  );
}
