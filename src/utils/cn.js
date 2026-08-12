/**
 * Minimal className combiner — works identically to clsx.
 * Usage: cn("base", condition && "extra", { active: isActive })
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object") {
        return Object.entries(input)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
          .join(" ");
      }
      return "";
    })
    .join(" ")
    .trim();
}
