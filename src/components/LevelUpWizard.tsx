import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Character, LevelUpRecord, CharacterFeature } from '../types/character';
import { ClassDefinition, ChoiceOption } from '../types/classDefinition';
import { AbilityScore } from '../types/character';

interface LevelUpWizardProps {
  character: Character;
  classDefinition: ClassDefinition;
  onComplete: (updatedCharacter: Character) => void;
  onCancel: () => void;
}

interface Choice {
  type: string;
  selections: string[];
}

interface ASIChoice {
  ability: AbilityScore;
  increase: number;
}

function LevelUpWizard({
  character,
  classDefinition,
  onComplete,
  onCancel,
}: LevelUpWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [hitPointsGained, setHitPointsGained] = useState(0);
  const [asiChoices, setAsiChoices] = useState<ASIChoice[]>([]);

  const newLevel = character.level + 1;
  const levelDef = classDefinition.levels.find((l) => l.level === newLevel);

  if (!levelDef) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-dnd-card rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-medieval text-dnd-accent mb-4">Cannot Level Up</h2>
          <p className="text-gray-300 mb-6">
            No level definition found for level {newLevel} in {classDefinition.name}.
          </p>
          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const availableChoices = levelDef.choices || [];
  const totalSteps =
    1 + // HP roll
    availableChoices.length +
    (levelDef.abilityScoreImprovement ? 1 : 0);

  useEffect(() => {
    // Initialize HP on first render
    if (hitPointsGained === 0) {
      const avgHP = Math.ceil(classDefinition.hitDie / 2) + 1;
      const conMod = Math.floor((character.abilityScores.constitution - 10) / 2);
      setHitPointsGained(avgHP + conMod);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep === 0) {
      // HP step - just move on
      setCurrentStep(currentStep + 1);
    } else if (currentStep <= availableChoices.length) {
      // Choice steps
      const choice = availableChoices[currentStep - 1];
      if (currentSelections.length >= choice.choose) {
        setChoices([
          ...choices,
          { type: choice.type, selections: [...currentSelections] },
        ]);
        setCurrentSelections([]);
        setCurrentStep(currentStep + 1);
      }
    } else {
      // ASI step or completion
      if (levelDef.abilityScoreImprovement && asiChoices.length > 0) {
        const asiStrings = asiChoices.map(
          (asi) => `${asi.ability} +${asi.increase}`
        );
        setChoices([
          ...choices,
          { type: 'ability-score-improvement', selections: asiStrings },
        ]);
      }
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Apply all choices
    let updatedCharacter: Character = {
      ...character,
      level: newLevel,
      proficiencyBonus: levelDef.proficiencyBonus,
    };

    // Apply HP increase
    updatedCharacter.hitPoints = {
      ...character.hitPoints,
      max: character.hitPoints.max + hitPointsGained,
      current: character.hitPoints.current + hitPointsGained,
    };

    // Apply ASI if present
    if (asiChoices.length > 0) {
      const newAbilityScores = { ...character.abilityScores };
      asiChoices.forEach((asi) => {
        newAbilityScores[asi.ability] =
          Math.min(20, newAbilityScores[asi.ability] + asi.increase);
      });
      updatedCharacter.abilityScores = newAbilityScores;
    }

    // Add base features from level definition
    const newFeatures: CharacterFeature[] = [
      ...character.features,
      ...levelDef.features.map((f) => ({
        name: f.name,
        description: f.description,
        source: `Class: ${classDefinition.name}`,
        type: f.type,
        usesResource: f.grantsResource?.name,
      })),
    ];

    // Add base resources from level definition
    const newResources = [
      ...character.resources,
      ...(levelDef.resources || [])
        .filter((r) => !r.conditional)
        .map((r) => ({
          name: r.name,
          icon: r.icon,
          current: typeof r.max === 'number' ? r.max : 0,
          max: typeof r.max === 'number' ? r.max : 0,
          rechargeOn: r.rechargeOn,
          displayType: r.displayType,
        })),
    ];

    // Process choices to apply subclass features, etc.
    let subclassName = character.subclassName;
    choices.forEach((choice) => {
      if (choice.type === 'subclass' && choice.selections.length > 0) {
        // Apply subclass
        const subclassChoice = availableChoices.find((c) => c.type === 'subclass');
        if (subclassChoice) {
          const selectedSubclass = subclassChoice.from.find(
            (opt) => opt.name === choice.selections[0]
          );
          if (selectedSubclass && selectedSubclass.grants) {
            subclassName = selectedSubclass.name;
            // Add subclass features
            if (selectedSubclass.grants.features) {
              selectedSubclass.grants.features.forEach((f) => {
                newFeatures.push({
                  name: f.name,
                  description: f.description,
                  source: `Subclass: ${selectedSubclass.name}`,
                  type: f.type,
                  usesResource: f.grantsResource?.name,
                });
              });
            }
            // Add subclass resources
            if (selectedSubclass.grants.resources) {
              selectedSubclass.grants.resources.forEach((r) => {
                newResources.push({
                  name: r.name,
                  icon: r.icon,
                  current: typeof r.max === 'number' ? r.max : 0,
                  max: typeof r.max === 'number' ? r.max : 0,
                  rechargeOn: r.rechargeOn,
                  displayType: r.displayType,
                });
              });
            }
          }
        }
      }
    });

    // Apply subclass features for this level if applicable
    if (subclassName && levelDef.subclassFeatures && levelDef.subclassFeatures[subclassName]) {
      levelDef.subclassFeatures[subclassName].forEach((f) => {
        newFeatures.push({
          name: f.name,
          description: f.description,
          source: `Subclass: ${subclassName}`,
          type: f.type,
          usesResource: f.grantsResource?.name,
        });

        // Add resource if feature grants one
        if (f.grantsResource) {
          const maxValue = typeof f.grantsResource.max === 'number'
            ? f.grantsResource.max
            : parseInt(f.grantsResource.max) || 0;
          newResources.push({
            name: f.grantsResource.name,
            icon: f.grantsResource.icon,
            current: maxValue,
            max: maxValue,
            rechargeOn: f.grantsResource.rechargeOn,
            displayType: 'slots',
          });
        }
      });
    }

    updatedCharacter.features = newFeatures;
    updatedCharacter.resources = newResources;
    updatedCharacter.subclassName = subclassName;

    // Create level history record
    const featuresGained = levelDef.features.map((f) => f.name);
    const resourcesGained = (levelDef.resources || []).map((r) => r.name);

    const levelUpRecord: LevelUpRecord = {
      level: newLevel,
      hitPointsGained,
      choicesMade: choices.concat(
        asiChoices.length > 0
          ? [
              {
                type: 'ability-score-improvement',
                selections: asiChoices.map(
                  (asi) => `${asi.ability} +${asi.increase}`
                ),
              },
            ]
          : []
      ),
      featuresGained,
      resourcesGained,
    };

    updatedCharacter.levelHistory = [...character.levelHistory, levelUpRecord];

    onComplete(updatedCharacter);
  };

  const toggleSelection = (optionName: string) => {
    const choice = availableChoices[currentStep - 1];
    if (currentSelections.includes(optionName)) {
      setCurrentSelections(currentSelections.filter((s) => s !== optionName));
    } else {
      if (currentSelections.length < choice.choose) {
        setCurrentSelections([...currentSelections, optionName]);
      }
    }
  };

  const handleASIChange = (ability: AbilityScore, change: number) => {
    const existingIndex = asiChoices.findIndex((asi) => asi.ability === ability);
    const totalPointsUsed = asiChoices.reduce((sum, asi) => sum + asi.increase, 0);
    const currentValue = character.abilityScores[ability];
    const currentIncrease =
      existingIndex >= 0 ? asiChoices[existingIndex].increase : 0;

    // Can't go above 20 or use more than 2 points total
    if (change > 0) {
      if (totalPointsUsed >= 2) return; // Max 2 points
      if (currentValue + currentIncrease >= 20) return; // Max 20
    } else {
      if (currentIncrease <= 0) return; // Can't go negative
    }

    const newAsiChoices = [...asiChoices];
    if (existingIndex >= 0) {
      newAsiChoices[existingIndex].increase += change;
      if (newAsiChoices[existingIndex].increase <= 0) {
        newAsiChoices.splice(existingIndex, 1);
      }
    } else if (change > 0) {
      newAsiChoices.push({ ability, increase: change });
    }

    setAsiChoices(newAsiChoices);
  };

  const renderStep = () => {
    if (currentStep === 0) {
      // HP Roll Step
      const conMod = Math.floor((character.abilityScores.constitution - 10) / 2);
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-medieval text-dnd-accent">Hit Points</h3>
          <p className="text-gray-300">
            Roll your hit die (d{classDefinition.hitDie}) or take the average.
          </p>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-center">
              <div className="text-6xl font-bold text-dnd-accent mb-2">
                +{hitPointsGained}
              </div>
              <div className="text-sm text-gray-400">
                Average ({Math.ceil(classDefinition.hitDie / 2) + 1}) + Constitution Modifier
                ({conMod >= 0 ? '+' : ''}
                {conMod})
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-400">
              New Max HP: {character.hitPoints.max} → {character.hitPoints.max + hitPointsGained}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            In a real game, you would roll a d{classDefinition.hitDie}. This wizard uses the
            average value.
          </div>
        </div>
      );
    } else if (currentStep <= availableChoices.length) {
      // Choice Step
      const choice = availableChoices[currentStep - 1];
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-medieval text-dnd-accent mb-2">{choice.prompt}</h3>
            <p className="text-gray-400 text-sm">
              Choose {choice.choose} option{choice.choose !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {choice.from.map((option) => (
              <ChoiceCard
                key={option.name}
                option={option}
                selected={currentSelections.includes(option.name)}
                onToggle={() => toggleSelection(option.name)}
              />
            ))}
          </div>

          <div className="text-sm text-gray-400 text-center">
            Selected: {currentSelections.length} / {choice.choose}
          </div>
        </div>
      );
    } else if (levelDef.abilityScoreImprovement) {
      // ASI Step
      const totalPointsUsed = asiChoices.reduce((sum, asi) => sum + asi.increase, 0);
      const abilityScoreOrder: AbilityScore[] = [
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma',
      ];

      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-medieval text-dnd-accent">Ability Score Improvement</h3>
          <p className="text-gray-300">
            Increase one ability score by 2, or two ability scores by 1 each.
          </p>

          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="text-center text-dnd-accent font-bold text-lg">
              Points Used: {totalPointsUsed} / 2
            </div>
          </div>

          <div className="space-y-3">
            {abilityScoreOrder.map((ability) => {
              const current = character.abilityScores[ability];
              const asiChoice = asiChoices.find((asi) => asi.ability === ability);
              const increase = asiChoice ? asiChoice.increase : 0;
              const newValue = current + increase;

              return (
                <div
                  key={ability}
                  className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-white capitalize">{ability}</div>
                    <div className="text-sm text-gray-400">
                      Current: {current} {increase > 0 && `→ ${newValue}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleASIChange(ability, -1)}
                      disabled={increase <= 0}
                      className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white font-bold"
                    >
                      −
                    </button>
                    <div className="w-12 text-center font-bold text-dnd-accent text-xl">
                      +{increase}
                    </div>
                    <button
                      onClick={() => handleASIChange(ability, 1)}
                      disabled={totalPointsUsed >= 2 || newValue >= 20}
                      className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded">
            <p>
              <span className="font-semibold">Note:</span> Ability scores cannot exceed 20.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep <= availableChoices.length) {
      const choice = availableChoices[currentStep - 1];
      return currentSelections.length >= choice.choose;
    }
    if (levelDef.abilityScoreImprovement) {
      const totalPointsUsed = asiChoices.reduce((sum, asi) => sum + asi.increase, 0);
      return totalPointsUsed === 2; // Must use exactly 2 points
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dnd-card rounded-lg p-8 max-w-3xl w-full my-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-medieval text-dnd-accent mb-2">Level Up!</h2>
          <p className="text-gray-300">
            {character.name} - Level {character.level} → {newLevel}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              className="h-full bg-dnd-accent"
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-4">
          {currentStep === 0 ? (
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentStep(Math.max(0, currentStep - 1));
                if (currentStep === totalSteps - 1 && levelDef.abilityScoreImprovement) {
                  // Going back from ASI step, clear ASI choices
                  setAsiChoices([]);
                } else if (currentStep > 1 && currentStep <= availableChoices.length) {
                  // Going back from a choice step
                  const previousChoiceIndex = choices.length - 1;
                  if (previousChoiceIndex >= 0) {
                    setCurrentSelections(choices[previousChoiceIndex].selections);
                    setChoices(choices.slice(0, -1));
                  }
                }
              }}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-dnd-accent text-dnd-bg font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        {/* Features Preview */}
        {levelDef.features.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">
              Features Gained This Level:
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              {levelDef.features.map((feature) => (
                <li key={feature.name}>• {feature.name}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ChoiceCard({
  option,
  selected,
  onToggle,
}: {
  option: ChoiceOption;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        selected
          ? 'border-dnd-accent bg-dnd-accent/20'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-white flex items-center gap-2">
            {option.name}
            {selected && <span className="text-dnd-accent">✓</span>}
          </h4>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{option.description}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-gray-400 hover:text-gray-300 ml-2"
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-700"
          >
            <p className="text-sm text-gray-300">{option.description}</p>
            {option.prerequisites && (
              <div className="mt-2 text-xs text-gray-400">
                <span className="font-semibold">Prerequisites:</span>{' '}
                {option.prerequisites.other || 'None'}
              </div>
            )}
            {/* Show granted features if this is a subclass */}
            {option.grants && option.grants.features && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-dnd-accent mb-1">
                  Features Granted:
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  {option.grants.features.map((f, i) => (
                    <li key={i}>• {f.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LevelUpWizard;
