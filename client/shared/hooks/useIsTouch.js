"use client";
import { useEffect, useState } from "react";

export default function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(
        window.matchMedia("(hover: none) and (pointer: coarse)").matches
      );
    }
  }, []);
  return isTouch;
}
