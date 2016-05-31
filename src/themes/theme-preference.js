import {lightThemes, darkThemes} from './themes';

const themeStorageKey = 'SELECTED_THEME';

export class ThemePreference {
  loadThemePreference() {
    let savedTheme = localStorage.getItem(themeStorageKey);

    if (savedTheme) {
      return findThemeObject(savedTheme);
    }
    return null;
  }

  saveThemePreference(theme) {
    localStorage.setItem(themeStorageKey, JSON.stringify(theme));
    return;
  }
}

function findThemeObject(savedTheme) {
  const themeObject = JSON.parse(savedTheme);

  let foundTheme = lightThemes.find(theme => theme.aceTheme === themeObject.aceTheme);
  if (foundTheme) {
    return foundTheme;
  }

  foundTheme = darkThemes.find(theme => theme.aceTheme === themeObject.aceTheme);

  if (foundTheme) {
    return foundTheme;
  }

  // by default return the first light theme
  return lightThemes[0];
}
