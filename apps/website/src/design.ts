export const designVariants = ["workshop", "ledger", "atlas"] as const;
export type DesignVariant = (typeof designVariants)[number];

export function isDesignVariant(value: unknown): value is DesignVariant {
  return designVariants.some((variant) => variant === value);
}

export function readDesign(value: unknown): DesignVariant {
  return isDesignVariant(value) ? value : "workshop";
}
