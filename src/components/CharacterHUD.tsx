import { Character } from '../types/character';
import ResourceTracker from './ResourceTracker';
import RestPanel from './RestPanel';
import SpellManager from './SpellManager';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CharacterHUDProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

function CharacterHUD({ character, onCharacterUpdate }: CharacterHUDProps) {
  const [showInventory, setShowInventory] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSpells, setShowSpells] = useState(false);

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

  const hpPercentage = (character.hitPoints.current / character.hitPoints.max) * 100;

  return (
    <div className="min-h-screen relative">
      {/* Top Currency Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-gray-900 via-gray-800/95 to-transparent border-b border-yellow-600/30">
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-dnd-accent font-medieval text-2xl">{character.name}</div>
            <div className="text-gray-400 text-sm">
              Level {character.level} {character.race} {character.className}
              {character.subclassName && ` (${character.subclassName})`}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CurrencyDisplay label="PP" value={character.inventory.currency.platinum} color="bg-gradient-to-br from-gray-200 to-gray-400" />
            <CurrencyDisplay label="GP" value={character.inventory.currency.gold} color="bg-gradient-to-br from-yellow-400 to-yellow-600" />
            <CurrencyDisplay label="SP" value={character.inventory.currency.silver} color="bg-gradient-to-br from-gray-300 to-gray-500" />
            <CurrencyDisplay label="CP" value={character.inventory.currency.copper} color="bg-gradient-to-br from-orange-600 to-orange-800" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-16 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Ability Scores & Core Stats */}
            <div className="col-span-2 space-y-3">
              <div className="bg-gray-900/90 border-2 border-yellow-600/50 rounded-lg p-3">
                <div className="text-xs font-bold text-dnd-accent mb-2 text-center">ABILITY SCORES</div>
                <div className="space-y-2">
                  {Object.entries(character.abilityScores).map(([ability, score]) => (
                    <AbilityScoreCompact
                      key={ability}
                      name={ability.substring(0, 3).toUpperCase()}
                      score={score}
                      modifier={Math.floor((score - 10) / 2)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/90 border-2 border-yellow-600/50 rounded-lg p-3">
                <div className="text-xs font-bold text-dnd-accent mb-2 text-center">CORE STATS</div>
                <div className="space-y-2">
                  <StatLineCompact label="SPEED" value={`${character.speed} ft`} />
                  <StatLineCompact label="INIT" value={`+${character.initiative}`} />
                  <StatLineCompact label="PROF" value={`+${character.proficiencyBonus}`} />
                </div>
              </div>
            </div>

            {/* Center Area - Character Portrait & Info */}
            <div className="col-span-8 space-y-4">
              {/* Character Portrait Placeholder */}
              <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 border-4 border-yellow-600/50 rounded-lg p-8 flex items-center justify-center" style={{ height: '400px' }}>
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-700/50 rounded-full border-4 border-dnd-accent flex items-center justify-center mb-4">
                    <span className="text-6xl">{character.race === 'Human' ? '🧔' : character.race === 'Elf' ? '🧝' : '⚔️'}</span>
                  </div>
                  <div className="text-gray-400 text-sm">Character Portrait</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInventory(!showInventory)}
                  className={`py-3 rounded-lg border-2 font-semibold transition-colors ${
                    showInventory
                      ? 'bg-dnd-accent text-dnd-bg border-dnd-accent'
                      : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600'
                  }`}
                >
                  🎒 Inventory
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFeatures(!showFeatures)}
                  className={`py-3 rounded-lg border-2 font-semibold transition-colors ${
                    showFeatures
                      ? 'bg-dnd-accent text-dnd-bg border-dnd-accent'
                      : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600'
                  }`}
                >
                  ⭐ Features
                </motion.button>
                {character.spellcasting && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSpells(!showSpells)}
                    className={`py-3 rounded-lg border-2 font-semibold transition-colors ${
                      showSpells
                        ? 'bg-dnd-accent text-dnd-bg border-dnd-accent'
                        : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    ✨ Spells
                  </motion.button>
                )}
              </div>

              {/* Conditional Panels */}
              {showInventory && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/90 border-2 border-yellow-600/50 rounded-lg p-4 max-h-96 overflow-y-auto"
                >
                  <h3 className="text-xl font-medieval text-dnd-accent mb-4">Inventory</h3>
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
                </motion.div>
              )}

              {showFeatures && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/90 border-2 border-yellow-600/50 rounded-lg p-4 max-h-96 overflow-y-auto"
                >
                  <h3 className="text-xl font-medieval text-dnd-accent mb-4">Features & Abilities</h3>
                  <div className="space-y-3">
                    {character.features.map((feature, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-dnd-accent pl-3 py-2 bg-gray-800/50 rounded-r"
                      >
                        <h4 className="font-semibold text-white">{feature.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {feature.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{feature.source}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showSpells && character.spellcasting && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-h-96 overflow-y-auto"
                >
                  <SpellManager character={character} onCharacterUpdate={onCharacterUpdate} />
                </motion.div>
              )}
            </div>

            {/* Right Sidebar - Rest Panel */}
            <div className="col-span-2">
              <RestPanel character={character} onCharacterUpdate={onCharacterUpdate} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD - Resources & HP */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Resources Bar */}
        <div className="bg-gradient-to-t from-gray-900/95 via-gray-800/95 to-transparent border-t border-yellow-600/30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {character.resources.map((resource) => (
              <div key={resource.name} className="flex-1">
                <ResourceTracker
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
              </div>
            ))}
          </div>
        </div>

        {/* HP Bar & AC Shield */}
        <div className="bg-gray-900/98 border-t-4 border-yellow-600/50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            {/* AC Shield */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-28 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-4 border-yellow-600 flex flex-col items-center justify-center shadow-lg">
                <div className="text-xs text-gray-400 uppercase font-bold">AC</div>
                <div className="text-4xl font-bold text-dnd-accent">{character.armorClass}</div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  <span className="font-medieval text-xl text-white">Hit Points</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHPUpdate(character.hitPoints.current - 1)}
                    className="w-10 h-10 rounded-full bg-red-700 hover:bg-red-600 transition-colors flex items-center justify-center text-white font-bold text-xl"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {character.hitPoints.current}
                    </div>
                    <div className="text-sm text-gray-400">
                      / {character.hitPoints.max}
                    </div>
                  </div>
                  <button
                    onClick={() => handleHPUpdate(character.hitPoints.current + 1)}
                    className="w-10 h-10 rounded-full bg-green-700 hover:bg-green-600 transition-colors flex items-center justify-center text-white font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
                <motion.div
                  initial={{ width: `${hpPercentage}%` }}
                  animate={{ width: `${hpPercentage}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className={`h-full rounded-full shadow-lg ${
                    hpPercentage > 50
                      ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-green-500/50'
                      : hpPercentage > 25
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-yellow-500/50'
                      : 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/50'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-sm">
                    {character.hitPoints.current} / {character.hitPoints.max} HP
                  </div>
                </div>
              </div>
              {character.hitPoints.temporary > 0 && (
                <div className="mt-2 text-center text-sm text-blue-400">
                  +{character.hitPoints.temporary} Temporary HP
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function AbilityScoreCompact({
  name,
  score,
  modifier,
}: {
  name: string;
  score: number;
  modifier: number;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
      <span className="text-xs text-gray-400 uppercase font-bold">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">{score}</span>
        <span className="text-sm text-dnd-accent">
          {modifier >= 0 ? '+' : ''}
          {modifier}
        </span>
      </div>
    </div>
  );
}

function StatLineCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
      <span className="text-xs text-gray-400 uppercase font-bold">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
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
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 ${color} rounded-full shadow-lg`} />
      <div className="text-right">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

export default CharacterHUD;
