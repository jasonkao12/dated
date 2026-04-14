export const LightColors = {
  primary: '#734e97',
  primaryLight: '#9b7ab8',
  background: '#F0F0E9',
  card: '#ffffff',
  foreground: '#2D1F3D',
  muted: '#9e8fb0',
  mutedFg: '#5a4d6a',
  border: '#e0dae8',
  accent: '#83D6E6',
  destructive: '#dc2626',
}

export const DarkColors = {
  primary: '#9b7ab8',
  primaryLight: '#734e97',
  background: '#1a1025',
  card: '#251835',
  foreground: '#f0ebf7',
  muted: '#6b5a80',
  mutedFg: '#a090b8',
  border: '#3a2850',
  accent: '#72c5d5',
  destructive: '#e05370',
}

// Backward-compat default — screens pick up live theme via useThemeColors()
export const Colors = LightColors
