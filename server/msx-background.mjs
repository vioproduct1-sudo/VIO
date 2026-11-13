// Backgrounds and foreground UI use different coordinate systems in MSX.
// Keep the background free of UI elements to avoid a scaled second copy.
export const skinBackdrop='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#0a1019"/></svg>');
