// The import makes this file a module, so the block below augments React instead of replacing it.
import type * as React from "react";

declare module "react" {
  // Allow CSS custom properties (`--name`) in `style` without casting.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
