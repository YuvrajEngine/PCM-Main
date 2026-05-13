// src/theme/abgTheme.ts
import { createTheme } from '@fluentui/react';

export const abgTheme = createTheme({
  palette: {
    themePrimary: '#F68529',    // Still Orange - active/hover
    themeDark: '#D51F26',       // Simple Red - for alerts if needed
    themeDarker: '#8C3A0B',     // Korma Brown
    white: '#FFFFFF',
    black: '#231F20',
    neutralDark: '#231F20',
    neutralPrimary: '#231F20',
    neutralSecondary: '#8C3A0B',
    neutralLight: '#DCDDDE',
    neutralLighter: '#F3F2F1',
  },
  fonts: {
    medium: {
      fontFamily: '"Hind Vadodara", "Segoe UI", sans-serif', // ABG uses Hind Vadodara heavily
      fontSize: '15px',
    },
  },
});