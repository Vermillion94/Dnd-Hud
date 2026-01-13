/**
 * Character Utility Functions
 *
 * Helper functions for working with multi-class characters
 */

import { Character, CharacterClass } from '../types/character';

/**
 * Get total character level (sum of all class levels)
 */
export function getTotalLevel(character: Character): number {
  // Support legacy single-class format
  if (character.level !== undefined && !character.classes.length) {
    return character.level;
  }

  return character.classes.reduce((total, cls) => total + cls.level, 0);
}

/**
 * Get primary class (the one with highest level, or first if tied)
 */
export function getPrimaryClass(character: Character): CharacterClass | undefined {
  // Support legacy single-class format
  if (character.className && !character.classes.length) {
    return {
      className: character.className,
      subclassName: character.subclassName,
      level: character.level || 1,
    };
  }

  if (!character.classes.length) return undefined;

  return character.classes.reduce((primary, current) =>
    current.level > primary.level ? current : primary
  );
}

/**
 * Get formatted class display string (e.g., "Fighter 5 / Wizard 3")
 */
export function getClassDisplayString(character: Character): string {
  // Support legacy single-class format
  if (character.className && !character.classes.length) {
    const subclass = character.subclassName ? ` (${character.subclassName})` : '';
    return `Level ${character.level} ${character.className}${subclass}`;
  }

  if (!character.classes.length) return 'No Class';

  const totalLevel = getTotalLevel(character);
  const classStrings = character.classes
    .map((cls) => {
      const subclass = cls.subclassName ? ` (${cls.subclassName})` : '';
      return `${cls.className}${subclass} ${cls.level}`;
    })
    .join(' / ');

  return `Level ${totalLevel} ${classStrings}`;
}

/**
 * Check if character has a specific class
 */
export function hasClass(character: Character, className: string): boolean {
  // Support legacy single-class format
  if (character.className && !character.classes.length) {
    return character.className === className;
  }

  return character.classes.some((cls) => cls.className === className);
}

/**
 * Get level in a specific class
 */
export function getClassLevel(character: Character, className: string): number {
  // Support legacy single-class format
  if (character.className && !character.classes.length) {
    return character.className === className ? character.level || 1 : 0;
  }

  const cls = character.classes.find((c) => c.className === className);
  return cls?.level || 0;
}

/**
 * Calculate proficiency bonus based on total character level
 */
export function getProficiencyBonus(character: Character): number {
  const totalLevel = getTotalLevel(character);
  return Math.floor((totalLevel - 1) / 4) + 2;
}

/**
 * Migrate legacy single-class character to multi-class format
 */
export function migrateToMultiClass(character: Character): Character {
  // Already using new format
  if (character.classes.length > 0) return character;

  // Has legacy format
  if (character.className) {
    return {
      ...character,
      classes: [
        {
          className: character.className,
          subclassName: character.subclassName,
          level: character.level || 1,
        },
      ],
    };
  }

  // No class data at all
  return character;
}
