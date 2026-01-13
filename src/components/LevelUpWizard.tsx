import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Character, LevelUpRecord } from '../types/character';
import { ClassDefinition, ChoiceOption } from '../types/classDefinition';

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
      if (levelDef.abilityScoreImprovement) {
        // Handle ASI
        setChoices([
          ...choices,
          { type: 'ability-score-improvement', selections: currentSelections },
        ]);
      }
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Apply level up changes
    const featuresGained = levelDef.features.map((f) => f.name);
    const resourcesGained = (levelDef.resources || []).map((r) => r.name);

    const levelUpRecord: LevelUpRecord = {
      level: newLevel,
      hitPointsGained,
      choicesMade: choices,
      featuresGained,
      resourcesGained,
    };

    const updatedCharacter: Character = {
      ...character,
      level: newLevel,
      proficiencyBonus: levelDef.proficiencyBonus,
      hitPoints: {
        ...character.hitPoints,
        max: character.hitPoints.max + hitPointsGained,
        current: character.hitPoints.current + hitPointsGained,
      },
      features: [
        ...character.features,
        ...levelDef.features.map((f) => ({
          name: f.name,
          description: f.description,
          source: `Class: ${classDefinition.name}`,
          type: f.type,
          usesResource: f.grantsResource?.name,
        })),
      ],
      resources: [
        ...character.resources,
        ...(levelDef.resources || []).map((r) => ({
          name: r.name,
          icon: r.icon,
          current: typeof r.max === 'number' ? r.max : 0,
          max: typeof r.max === 'number' ? r.max : 0,
          rechargeOn: r.rechargeOn,
          displayType: r.displayType,
        })),
      ],
      levelHistory: [...character.levelHistory, levelUpRecord],
    };

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

          <div className="space-y-3">
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
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-medieval text-dnd-accent">Ability Score Improvement</h3>
          <p className="text-gray-300">
            Increase one ability score by 2, or two ability scores by 1 each. Alternatively, you
            could take a feat (feat system not yet implemented).
          </p>

          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400">
              Ability Score Improvement selection coming soon. For now, this will be recorded in
              your level history.
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
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LevelUpWizard;
