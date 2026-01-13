/**
 * Class Definition Types
 *
 * These types define the structure of class definition JSON files (e.g., Fighter.json).
 * Class definitions contain ALL possible options at each level - they are the "rulebook"
 * that the level-up wizard uses to present choices to the player.
 */

export interface ClassDefinition {
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: AbilityScore[];
  savingThrows: AbilityScore[];

  // Starting proficiencies and equipment
  startingProficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    skills: {
      choose: number;
      from: string[];
    };
  };

  startingEquipment: {
    description: string;
    choices: EquipmentChoice[];
  };

  // Level progression with all options
  levels: LevelDefinition[];

  // Spellcasting info (if applicable)
  spellcasting?: SpellcastingDefinition;
}

export interface LevelDefinition {
  level: number;
  features: FeatureGrant[];

  // Choices that need to be made at this level
  choices?: LevelChoice[];

  // Resources gained or updated
  resources?: ResourceGrant[];

  // Ability score improvement/feat choice
  abilityScoreImprovement?: boolean;

  // Proficiency bonus at this level
  proficiencyBonus: number;

  // Spells known, cantrips, spell slots (if spellcaster)
  spellSlots?: number[];
  spellsKnown?: number;
  cantripsKnown?: number;
}

export interface FeatureGrant {
  name: string;
  description: string;
  type: 'passive' | 'active' | 'resource';

  // If this feature grants a resource (e.g., Channel Divinity, Ki Points)
  grantsResource?: {
    name: string;
    icon: string;
    max: number | string; // Can be a number or formula like "level + proficiencyBonus"
    rechargeOn: 'short-rest' | 'long-rest' | 'dawn' | 'manual';
  };

  // If this feature modifies an existing resource
  modifiesResource?: {
    name: string;
    change: string; // e.g., "+1", "*2", "=level"
  };
}

export interface LevelChoice {
  type: 'subclass' | 'spell' | 'feature-option' | 'fighting-style' | 'maneuver' | 'invocation' | 'metamagic';
  prompt: string;
  choose: number;
  from: ChoiceOption[];
}

export interface ChoiceOption {
  name: string;
  description: string;

  // Prerequisites for this choice
  prerequisites?: {
    level?: number;
    features?: string[];
    spells?: string[];
    other?: string;
  };

  // What this choice grants
  grants?: {
    features?: FeatureGrant[];
    spells?: string[];
    resources?: ResourceGrant[];
  };
}

export interface ResourceGrant {
  name: string;
  icon: string; // Emoji or icon identifier
  max: number | string; // Number or formula
  rechargeOn: 'short-rest' | 'long-rest' | 'dawn' | 'manual' | 'none';
  displayType: 'slots' | 'number' | 'bar';
}

export interface SpellcastingDefinition {
  ability: AbilityScore;
  spellList: string; // e.g., "Wizard", "Cleric", "Paladin"

  // All available spells organized by level
  spells: {
    [level: number]: SpellDefinition[];
  };

  // Spell preparation rules
  preparation: 'prepared' | 'known' | 'none';
  preparedCount?: string; // Formula like "level + abilityModifier"
}

export interface SpellDefinition {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;

  // For rituals, concentration, etc.
  ritual?: boolean;
  concentration?: boolean;
}

export interface EquipmentChoice {
  choose: number;
  from: string[];
}

export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
