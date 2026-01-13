import { Character } from '../types/character';
import { ClassDefinition } from '../types/classDefinition';

/**
 * Import a character from a JSON file
 */
export const importCharacter = (): Promise<Character> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const character = JSON.parse(event.target?.result as string) as Character;
          resolve(character);
        } catch (error) {
          reject(new Error('Invalid character file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
};

/**
 * Export a character to a JSON file
 */
export const exportCharacter = (character: Character) => {
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import a class definition from a JSON file
 */
export const importClassDefinition = (): Promise<ClassDefinition> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const classDef = JSON.parse(event.target?.result as string) as ClassDefinition;
          resolve(classDef);
        } catch (error) {
          reject(new Error('Invalid class definition file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
};

/**
 * Export a class definition to a JSON file
 */
export const exportClassDefinition = (classDef: ClassDefinition) => {
  const json = JSON.stringify(classDef, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${classDef.name.toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Load example character (for demo purposes)
 */
export const loadExampleCharacter = async (type: 'fighter' | 'wizard' = 'fighter'): Promise<Character> => {
  try {
    const filename = type === 'wizard' ? 'example-wizard.json' : 'example-character.json';
    const response = await fetch(`/src/schemas/${filename}`);
    if (!response.ok) throw new Error('Failed to load example character');
    return await response.json();
  } catch (error) {
    throw new Error('Failed to load example character');
  }
};

/**
 * Load example class definition (for demo purposes)
 */
export const loadExampleClass = async (className: 'Fighter' | 'Wizard'): Promise<ClassDefinition> => {
  try {
    const response = await fetch(`/src/schemas/${className}.json`);
    if (!response.ok) throw new Error('Failed to load example class');
    return await response.json();
  } catch (error) {
    throw new Error('Failed to load example class');
  }
};
