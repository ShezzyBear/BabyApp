export type ThemeMode = "light" | "dark" | "system";

export interface Theme {
  mode: "light" | "dark";
  colors: {
    background: string;
    surface: string;
    primaryAccent: string;
    secondaryAccent: string;
    primaryText: string;
    secondaryText: string;
    destructive: string;
    success: string;
    divider: string;
    tabBarBackground: string;
    tabBarBorder: string;
    inputBackground: string;
    inputBorder: string;
    placeholder: string;
  };
}

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    background: "#FFF8F0",
    surface: "#FFFFFF",
    primaryAccent: "#5AB9EA",
    secondaryAccent: "#F5C6D0",
    primaryText: "#2D2D2D",
    secondaryText: "#8E8E93",
    destructive: "#E57373",
    success: "#81C784",
    divider: "#F0E6D8",
    tabBarBackground: "#FFFFFF",
    tabBarBorder: "#F0E6D8",
    inputBackground: "#FFFFFF",
    inputBorder: "#E8DDD0",
    placeholder: "#BDBDBD",
  },
};

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    background: "#1C1C1E",
    surface: "#2C2C2E",
    primaryAccent: "#5AB9EA",
    secondaryAccent: "#F5C6D0",
    primaryText: "#F5F5F5",
    secondaryText: "#8E8E93",
    destructive: "#EF9A9A",
    success: "#A5D6A7",
    divider: "#3A3A3C",
    tabBarBackground: "#1C1C1E",
    tabBarBorder: "#3A3A3C",
    inputBackground: "#3A3A3C",
    inputBorder: "#4A4A4C",
    placeholder: "#6E6E73",
  },
};