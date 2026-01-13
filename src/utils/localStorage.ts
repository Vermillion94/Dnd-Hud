import { Character } from '../types/character';

const STORAGE_KEY = 'dnd-hud-character';
const RECENT_CHARACTERS_KEY = 'dnd-hud-recent-characters';

/**
 * Save character to local storage
 */
export const saveCharacterToStorage = (character: Character): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    addToRecentCharacters(character);
  } catch (error) {
    console.error('Failed to save character to storage:', error);
  }
};

/**
 * Load character from local storage
 */
export const loadCharacterFromStorage = (): Character | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Character;
  } catch (error) {
    console.error('Failed to load character from storage:', error);
    return null;
  }
};

/**
 * Clear character from local storage
 */
export const clearCharacterFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear character from storage:', error);
  }
};

/**
 * Add character to recent characters list
 */
const addToRecentCharacters = (character: Character): void => {
  try {
    const stored = localStorage.getItem(RECENT_CHARACTERS_KEY);
    let recent: Array<{ id: string; name: string; level: number; className: string }> = stored
      ? JSON.parse(stored)
      : [];

    // Remove if already exists
    recent = recent.filter((char) => char.id !== character.id);

    // Add to beginning
    recent.unshift({
      id: character.id,
      name: character.name,
      level: character.level,
      className: character.className,
    });

    // Keep only last 10
    recent = recent.slice(0, 10);

    localStorage.setItem(RECENT_CHARACTERS_KEY, JSON.stringify(recent));
  } catch (error) {
    console.error('Failed to update recent characters:', error);
  }
};

/**
 * Get recent characters list
 */
export const getRecentCharacters = (): Array<{
  id: string;
  name: string;
  level: number;
  className: string;
}> => {
  try {
    const stored = localStorage.getItem(RECENT_CHARACTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get recent characters:', error);
    return [];
  }
};

/**
 * Auto-save functionality
 */
export const setupAutoSave = (
  getCharacter: () => Character | null,
  interval: number = 30000 // 30 seconds
): (() => void) => {
  const intervalId = setInterval(() => {
    const character = getCharacter();
    if (character) {
      saveCharacterToStorage(character);
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};
