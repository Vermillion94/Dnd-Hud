import { Character } from '../types/character';
import ResourceTracker from './ResourceTracker';
import { motion } from 'framer-motion';

interface CharacterHUDProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

function CharacterHUD({ character, onCharacterUpdate }: CharacterHUDProps) {
  const handleResourceUpdate = (resourceName: string, newCurrent: number) => {
    const updatedCharacter = {
      ...character,
      resources: character.resources.map((res) =>
        res.name === resourceName ? { ...res, current: newCurrent } : res
      ),
    };
    onCharacterUpdate(updatedCharacter);
  };

  const handleHPUpdate = (current: number) => {
    const updatedCharacter = {
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: Math.max(0, Math.min(current, character.hitPoints.max)),
      },
    };
    onCharacterUpdate(updatedCharacter);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-medieval text-dnd-accent mb-2">
            {character.name}
          </h1>
          <p className="text-xl text-gray-300">
            Level {character.level} {character.race} {character.className}
            {character.subclassName && ` (${character.subclassName})`}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Core Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* HP Tracker */}
            <div className="bg-dnd-card rounded-lg p-6 border-2 border-dnd-hp">
              <ResourceTracker
                name="Hit Points"
                icon="❤️"
                current={character.hitPoints.current}
                max={character.hitPoints.max}
                color="red"
                displayType="bar"
                onUpdate={handleHPUpdate}
              />
              {character.hitPoints.temporary > 0 && (
                <div className="mt-2 text-sm text-blue-400">
                  +{character.hitPoints.temporary} Temporary HP
                </div>
              )}
            </div>

            {/* Core Stats */}
            <div className="bg-dnd-card rounded-lg p-6">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Core Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatDisplay label="AC" value={character.armorClass} />
                <StatDisplay label="Initiative" value={`+${character.initiative}`} />
                <StatDisplay label="Speed" value={`${character.speed} ft`} />
                <StatDisplay label="Prof. Bonus" value={`+${character.proficiencyBonus}`} />
              </div>
            </div>

            {/* Ability Scores */}
            <div className="bg-dnd-card rounded-lg p-6">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Ability Scores
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(character.abilityScores).map(([ability, score]) => (
                  <AbilityScore
                    key={ability}
                    name={ability.substring(0, 3).toUpperCase()}
                    score={score}
                    modifier={Math.floor((score - 10) / 2)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Middle Column - Resources & Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Resources */}
            <div className="bg-dnd-card rounded-lg p-6">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Resources
              </h3>
              <div className="space-y-4">
                {character.resources.map((resource) => (
                  <ResourceTracker
                    key={resource.name}
                    name={resource.name}
                    icon={resource.icon}
                    current={resource.current}
                    max={resource.max}
                    color="blue"
                    displayType={resource.displayType}
                    rechargeOn={resource.rechargeOn}
                    onUpdate={(newCurrent) =>
                      handleResourceUpdate(resource.name, newCurrent)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-dnd-card rounded-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Features & Abilities
              </h3>
              <div className="space-y-3">
                {character.features.map((feature, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-dnd-accent pl-3 py-2"
                  >
                    <h4 className="font-semibold text-white">{feature.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{feature.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Inventory */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Currency */}
            <div className="bg-dnd-card rounded-lg p-6">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Currency
              </h3>
              <div className="grid grid-cols-5 gap-2 text-center">
                <CurrencyDisplay label="PP" value={character.inventory.currency.platinum} color="text-gray-300" />
                <CurrencyDisplay label="GP" value={character.inventory.currency.gold} color="text-yellow-400" />
                <CurrencyDisplay label="EP" value={character.inventory.currency.electrum} color="text-gray-400" />
                <CurrencyDisplay label="SP" value={character.inventory.currency.silver} color="text-gray-200" />
                <CurrencyDisplay label="CP" value={character.inventory.currency.copper} color="text-orange-600" />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-dnd-card rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <h3 className="text-xl font-medieval text-dnd-accent mb-4">
                Inventory
              </h3>
              <div className="space-y-2">
                {character.inventory.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${
                      item.equipped
                        ? 'bg-dnd-accent/20 border border-dnd-accent'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {item.name}
                          {item.equipped && <span className="text-xs">⚔️</span>}
                          {item.magical && <span className="text-xs">✨</span>}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-400">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
function StatDisplay({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center p-3 bg-gray-800 rounded-lg">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 uppercase">{label}</div>
    </div>
  );
}

function AbilityScore({
  name,
  score,
  modifier,
}: {
  name: string;
  score: number;
  modifier: number;
}) {
  return (
    <div className="text-center p-2 bg-gray-800 rounded-lg">
      <div className="text-xs text-gray-400 uppercase mb-1">{name}</div>
      <div className="text-xl font-bold text-white">{score}</div>
      <div className="text-sm text-dnd-accent">
        {modifier >= 0 ? '+' : ''}
        {modifier}
      </div>
    </div>
  );
}

function CurrencyDisplay({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

export default CharacterHUD;
