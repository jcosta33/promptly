export const CSS_VARIABLES = {
  "--color-orange-50": { light: "#fff3e0", dark: "#ff6b35" },
  "--color-orange-100": { light: "#ffe0b2", dark: "#ff5722" },
  "--color-orange-300": { light: "#ffb74d", dark: "#e64a19" },
  "--color-orange-500": { light: "#ff9800", dark: "#dd2c00" },
  "--color-orange-700": { light: "#f57c00", dark: "#bf360c" },
  "--color-orange-900": { light: "#e65100", dark: "#9f0000" },

  "--color-blue-300": { light: "#64b5f6", dark: "#0d47a1" },
  "--color-blue-500": { light: "#2196f3", dark: "#0a3880" },
  "--color-blue-700": { light: "#1976d2", dark: "#072a60" },

  "--color-gray-50": { light: "#fafafa", dark: "#212121" },
  "--color-gray-100": { light: "#f5f5f5", dark: "#1a1a1a" },
  "--color-gray-200": { light: "#eeeeee", dark: "#303030" },
  "--color-gray-300": { light: "#e0e0e0", dark: "#424242" },
  "--color-gray-400": { light: "#bdbdbd", dark: "#616161" },
  "--color-gray-500": { light: "#9e9e9e", dark: "#757575" },
  "--color-gray-700": { light: "#616161", dark: "#bdbdbd" },
  "--color-gray-900": { light: "#212121", dark: "#f5f5f5" },

  "--color-black": { light: "#000000", dark: "#000000" },
  "--color-white": { light: "#ffffff", dark: "#ffffff" },

  "--color-yellow-warning": { light: "#ffd600", dark: "#ffd600" },
  "--color-red-error": { light: "#d32f2f", dark: "#ff6b6b" },
  "--color-green-success": { light: "#388e3c", dark: "#69f0ae" },
  "--color-blue-info": { light: "#0288d1", dark: "#80d8ff" },

  "--primary-color": { light: "#ff9800", dark: "#ff6b35" },
  "--secondary-color": { light: "#2196f3", dark: "#0a3880" },
  "--tertiary-color": { light: "#e0e0e0", dark: "#424242" },
  "--danger-color": { light: "#d32f2f", dark: "#ff6b6b" },
  "--bg-color": { light: "#ffffff", dark: "#121212" },
  "--secondary-bg-color": { light: "#f0f0f0", dark: "#1e1e1e" },
  "--light-bg-color": { light: "#e0e0e0", dark: "#303030" },
  "--dark-bg-color": { light: "#121212", dark: "#f5f5f5" },

  "--text-color": { light: "#000000", dark: "#ffffff" },
  "--inverted-text-color": { light: "#ffffff", dark: "#000000" },
  "--color-text-muted": { light: "#616161", dark: "#bdbdbd" },
  "--border-color": { light: "#616161", dark: "#bdbdbd" },
  "--accent-color": { light: "#ff9800", dark: "#ff6b35" },
  "--disabled-color": { light: "#9e9e9e", dark: "#616161" },

  "--button-bg-color": { light: "#c0c0c0", dark: "#303030" },
  "--button-text-color": { light: "#000000", dark: "#ffffff" },
  "--button-hover-bg-color": { light: "#d9d9d9", dark: "#424242" },
  "--button-active-bg-color": { light: "#a0a0a0", dark: "#212121" },
  "--button-focus-outline-color": { light: "#ff9800", dark: "#ff6b35" },

  "--input-bg-color": { light: "#f5f5f5", dark: "#303030" },
  "--input-text-color": { light: "#000000", dark: "#ffffff" },
  "--input-border-color": { light: "#000000", dark: "#ffffff" },
  "--input-focus-border-color": { light: "#ff9800", dark: "#ff6b35" },

  "--inner-highlight": { light: "#ffffff", dark: "#424242" },
  "--inner-shadow": { light: "#808080", dark: "#212121" },

  "--color-text-primary": { light: "#000000", dark: "#ffffff" },
  "--color-text-secondary": { light: "#616161", dark: "#bdbdbd" },
  "--color-text-disabled": { light: "#9e9e9e", dark: "#616161" },
  "--color-text-accent": { light: "#ff9800", dark: "#ff6b35" },
  "--color-text-error": { light: "#d32f2f", dark: "#ff6b6b" },
  "--color-accent-primary": { light: "#ff9800", dark: "#ff6b35" },
  "--color-background-tertiary": { light: "#e0e0e0", dark: "#303030" },
  "--color-border-primary": { light: "#000000", dark: "#ffffff" },

  "--space-xxs": "2px",
  "--space-xs": "4px",
  "--space-sm": "8px",
  "--space-md": "16px",
  "--space-lg": "32px",
  "--space-xl": "48px",
  "--space-xxl": "64px",

  "--font-size-xs": "10px",
  "--font-size-sm": "12px",
  "--font-size-md": "14px",
  "--font-size-lg": "18px",
  "--font-size-xl": "22px",
  "--font-size-xxl": "32px",

  "--font-weight-normal": "400",
  "--font-weight-medium": "500",
  "--font-weight-bold": "700",
  "--font-weight-black": "900",

  "--border-width": "3px",
  "--border-width-thick": "5px",
  "--border-radius": "4px",
  "--border-radius-sm": "2px",
  "--shadow-offset": "4px",
  "--shadow-offset-lg": "8px",

  "--control-height-sm": "24px",
  "--control-height-md": "32px",
  "--control-height-lg": "40px",
  "--control-size-sm": "16px",
  "--control-size-md": "20px",
  "--control-size-lg": "24px",

  "--inset-border":
    "inset 1px 1px 0px var(--inner-shadow), inset -1px -1px 0px var(--inner-highlight)",
  "--outset-border":
    "inset -1px -1px 0px var(--inner-shadow), inset 1px 1px 0px var(--inner-highlight)",
  "--brutalist-shadow":
    "var(--shadow-offset) var(--shadow-offset) 0 0 var(--color-black)",
  "--double-border": "2px solid var(--color-black)",

  "--transition-fast": "100ms",
  "--transition-medium": "200ms",
  "--transition-slow": "300ms",

  "--z-index-dropdown": "1000",
  "--z-index-sticky": "1020",
  "--z-index-fixed": "1030",
  "--z-index-modal-backdrop": "1040",
  "--z-index-modal": "1050",
  "--z-index-popover": "1060",
  "--z-index-tooltip": "1070",
};

export function setTheme(darkMode: boolean): void {
  const root = document.documentElement;
  const mode = darkMode ? "dark" : "light";

  Object.entries(CSS_VARIABLES).forEach(([variable, value]) => {
    if (typeof value === "object" && "light" in value && "dark" in value) {
      root.style.setProperty(variable, value[mode]);
    } else {
      root.style.setProperty(variable, value as string);
    }
  });
}

export function detectPreferredColorScheme(): boolean {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function initTheme(userPrefersDark?: boolean | null): boolean {
  let darkMode: boolean;

  if (userPrefersDark === undefined || userPrefersDark === null) {
    darkMode = detectPreferredColorScheme();
  } else {
    darkMode = userPrefersDark;
  }

  setTheme(darkMode);

  if (userPrefersDark === undefined || userPrefersDark === null) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        setTheme(e.matches);
      });
  }

  return darkMode;
}
