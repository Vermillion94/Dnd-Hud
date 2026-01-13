/**
 * Character Types
 *
 * These types define the structure of character instance JSON files.
 * Characters contain the CHOSEN options and current state - they are the
 * player's specific character with all their selections made.
 */

import { AbilityScore } from './classDefinition';

export interface Character {
  // Basic info
  id: string;
  name: string;
  className: string; // References a ClassDefinition file
  subclassName?: string;
  level: number;
  race: string;
  background: string;
  alignment?: string;

  // Ability scores
  abilityScores: {
    [key in AbilityScore]: number;
  };

  // Core stats
  armorClass: number;
  proficiencyBonus: number;
  speed: number;
  initiative: number;

  // Hit points
  hitPoints: {
    current: number;
    max: number;
    temporary: number;
  };

  // Resources (spell slots, ki points, rage, etc.)
  resources: CharacterResource[];

  // Features and abilities
  features: CharacterFeature[];

  // Inventory
  inventory: {
    items: InventoryItem[];
    equipment: Equipment;
    currency: Currency;
  };

  // Spellcasting (if applicable)
  spellcasting?: CharacterSpellcasting;

  // Proficiencies
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
    skills: SkillProficiency[];
    savingThrows: AbilityScore[];
  };

  // Level-up history (tracks choices made)
  levelHistory: LevelUpRecord[];
}

export interface CharacterResource {
  name: string;
  icon: string;
  current: number;
  max: number;
  rechargeOn: 'short-rest' | 'long-rest' | 'dawn' | 'manual' | 'none';
  displayType: 'slots' | 'number' | 'bar';
}

export interface CharacterFeature {
  name: string;
  description: string;
  source: string; // e.g., "Class: Fighter", "Race: Elf", "Feat: Lucky"
  type: 'passive' | 'active' | 'resource';
  usesResource?: string; // Name of resource it consumes
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  weight: number;
  value: number; // In copper pieces
  category: 'weapon' | 'armor' | 'consumable' | 'tool' | 'treasure' | 'misc';
  equipped?: boolean;
  attuned?: boolean;
  magical?: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
}

export interface Equipment {
  mainHand?: InventoryItem;
  offHand?: InventoryItem;
  armor?: InventoryItem;
  accessory1?: InventoryItem;
  accessory2?: InventoryItem;
  accessory3?: InventoryItem;
}

export interface Currency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface CharacterSpellcasting {
  ability: AbilityScore;
  spellSaveDC: number;
  spellAttackBonus: number;

  // Spells the character knows/has prepared
  knownSpells: CharacterSpell[];
  preparedSpells?: string[]; // Names of prepared spells (if preparation-based)

  // Current spell slot usage
  spellSlots: {
    level: number;
    max: number;
    used: number;
  }[];
}

export interface CharacterSpell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  ritual?: boolean;
  concentration?: boolean;
  prepared?: boolean;
}

export interface SkillProficiency {
  skill: string;
  proficient: boolean;
  expertise?: boolean;
}

export interface LevelUpRecord {
  level: number;
  hitPointsGained: number;
  choicesMade: {
    type: string;
    selections: string[];
  }[];
  featuresGained: string[];
  resourcesGained: string[];
}
