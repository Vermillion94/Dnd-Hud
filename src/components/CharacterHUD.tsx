import { Character } from '../types/character';
import ResourceTracker from './ResourceTracker';
import SpellManager from './SpellManager';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CharacterHUDProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

type TabType = 'portrait' | 'inventory' | 'features' | 'spells' | 'resources';

function CharacterHUD({ character, onCharacterUpdate }: CharacterHUDProps) {
  const [activeTab, setActiveTab] = useState<TabType>('portrait');

  // Determine which resources go on hotbar (max <= 6 or explicitly set to 'hotbar')
  const shouldShowOnHotbar = (resource: Character['resources'][0]): boolean => {
    if (resource.displayLocation === 'panel') return false;
    if (resource.displayLocation === 'hotbar') return true;
    // Auto: use heuristic of max <= 6
    return resource.max <= 6;
  };

  const hotbarResources = character.resources.filter(shouldShowOnHotbar);
  const panelResources = character.resources.filter((r) => !shouldShowOnHotbar(r));

  const handleResourceUpdate = (resourceName: string, newCurrent: number) => {
    const updatedCharacter = {
      ...character,
      resources: character.resources.map((res) =>
        res.name === resourceName ? { ...res, current: newCurrent } : res
      ),
    };
    onCharacterUpdate(updatedCharacter);
  };

  const handleSpellSlotUpdate = (level: number, newUsed: number) => {
    if (!character.spellcasting) return;
    const updatedCharacter = {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        spellSlots: character.spellcasting.spellSlots.map((slot) =>
          slot.level === level ? { ...slot, used: Math.max(0, Math.min(newUsed, slot.max)) } : slot
        ),
      },
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

  const handleShortRest = () => {
    const updatedCharacter: Character = {
      ...character,
      resources: character.resources.map((resource) => {
        if (resource.rechargeOn === 'short-rest' || resource.rechargeOn === 'long-rest') {
          return { ...resource, current: resource.max };
        }
        return resource;
      }),
    };
    onCharacterUpdate(updatedCharacter);
  };

  const handleLongRest = () => {
    const updatedCharacter: Character = {
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: character.hitPoints.max,
        temporary: 0,
      },
      resources: character.resources.map((resource) => ({
        ...resource,
        current: resource.max,
      })),
      spellcasting: character.spellcasting
        ? {
            ...character.spellcasting,
            spellSlots: character.spellcasting.spellSlots.map((slot) => ({
              ...slot,
              used: 0,
            })),
          }
        : undefined,
    };
    onCharacterUpdate(updatedCharacter);
  };

  const hpPercentage = (character.hitPoints.current / character.hitPoints.max) * 100;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portrait':
        return (
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-gray-700/50 rounded-full border-4 border-dnd-accent flex items-center justify-center mb-4">
              <span className="text-6xl">
                {character.race === 'Human' ? '🧔' : character.race === 'High Elf' ? '🧝' : '⚔️'}
              </span>
            </div>
            <div className="text-gray-400 text-sm">Character Portrait</div>
          </div>
        );

      case 'inventory':
        return (
          <div className="h-full overflow-y-auto px-4">
            <h3 className="text-xl font-medieval text-dnd-accent mb-4 sticky top-0 bg-gray-900/95 py-2">
              Inventory
            </h3>
            <div className="space-y-2 pb-4">
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
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </div>
                    {item.quantity > 1 && (
                      <span className="text-sm text-gray-400">×{item.quantity}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="h-full overflow-y-auto px-4">
            <h3 className="text-xl font-medieval text-dnd-accent mb-4 sticky top-0 bg-gray-900/95 py-2">
              Features & Abilities
            </h3>
            <div className="space-y-3 pb-4">
              {character.features.map((feature, index) => (
                <div
                  key={index}
                  className="border-l-4 border-dnd-accent pl-3 py-2 bg-gray-800/50 rounded-r"
                >
                  <h4 className="font-semibold text-white">{feature.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{feature.source}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'spells':
        return character.spellcasting ? (
          <div className="h-full overflow-y-auto">
            <SpellManager character={character} onCharacterUpdate={onCharacterUpdate} />
          </div>
        ) : null;

      case 'resources':
        return (
          <div className="h-full overflow-y-auto px-4">
            <h3 className="text-xl font-medieval text-dnd-accent mb-4 sticky top-0 bg-gray-900/95 py-2">
              All Resources
            </h3>
            <div className="space-y-4 pb-4">
              {character.resources.map((resource) => (
                <div key={resource.name} className="bg-gray-800/50 rounded-lg p-4 border border-dnd-accent/30">
                  <ResourceTracker
                    name={resource.name}
                    icon={resource.icon}
                    current={resource.current}
                    max={resource.max}
                    color="blue"
                    displayType={resource.displayType}
                    rechargeOn={resource.rechargeOn}
                    onUpdate={(newCurrent) => handleResourceUpdate(resource.name, newCurrent)}
                  />
                </div>
              ))}
              {character.spellcasting && (
                <div className="mt-4">
                  <h4 className="text-lg font-medieval text-dnd-accent mb-3">Spell Slots</h4>
                  <div className="space-y-2">
                    {character.spellcasting.spellSlots
                      .filter((slot) => slot.max > 0)
                      .map((slot) => (
                        <div
                          key={slot.level}
                          className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30"
                        >
                          <SpellSlotTracker
                            level={slot.level}
                            max={slot.max}
                            used={slot.used}
                            onUpdate={(newUsed) => handleSpellSlotUpdate(slot.level, newUsed)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-wood-dark to-gray-900">
      {/* Top Currency Bar */}
      <div className="bg-wood-texture border-b-4 border-dnd-accent/60 shadow-medieval relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="px-6 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-8">
            <div className="text-dnd-accent font-medieval text-2xl">{character.name}</div>
            <div className="text-gray-400 text-sm">
              Level {character.level} {character.race} {character.className}
              {character.subclassName && ` (${character.subclassName})`}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CurrencyDisplay
              label="PP"
              value={character.inventory.currency.platinum}
              color="bg-gradient-to-br from-gray-200 to-gray-400"
            />
            <CurrencyDisplay
              label="GP"
              value={character.inventory.currency.gold}
              color="bg-gradient-to-br from-yellow-400 to-yellow-600"
            />
            <CurrencyDisplay
              label="SP"
              value={character.inventory.currency.silver}
              color="bg-gradient-to-br from-gray-300 to-gray-500"
            />
            <CurrencyDisplay
              label="CP"
              value={character.inventory.currency.copper}
              color="bg-gradient-to-br from-orange-600 to-orange-800"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Ability Scores & Core Stats */}
            <div className="col-span-2 space-y-3">
              <div className="relative bg-wood-texture border-4 border-dnd-accent/70 rounded-lg p-3 shadow-medieval overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/30" />
                <OrnateCorner position="top-left" />
                <OrnateCorner position="top-right" />
                <OrnateCorner position="bottom-left" />
                <OrnateCorner position="bottom-right" />
                <div className="relative z-10 text-xs font-bold font-medieval text-dnd-accent mb-2 text-center drop-shadow-lg">
                  ABILITY SCORES
                </div>
                <div className="relative z-10 space-y-2">
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

              <div className="relative bg-wood-texture border-4 border-dnd-accent/70 rounded-lg p-3 shadow-medieval overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/30" />
                <OrnateCorner position="top-left" />
                <OrnateCorner position="top-right" />
                <OrnateCorner position="bottom-left" />
                <OrnateCorner position="bottom-right" />
                <div className="relative z-10 text-xs font-bold font-medieval text-dnd-accent mb-2 text-center drop-shadow-lg">
                  CORE STATS
                </div>
                <div className="relative z-10 space-y-2">
                  <StatLineCompact label="SPEED" value={`${character.speed} ft`} />
                  <StatLineCompact label="INIT" value={`+${character.initiative}`} />
                  <StatLineCompact label="PROF" value={`+${character.proficiencyBonus}`} />
                </div>
              </div>
            </div>

            {/* Center Area - Tabbed Interface */}
            <div className="col-span-8 space-y-4">
              {/* Tab Navigation */}
              <div className="flex gap-2">
                <TabButton
                  active={activeTab === 'portrait'}
                  onClick={() => setActiveTab('portrait')}
                  icon="👤"
                  label="Character"
                />
                <TabButton
                  active={activeTab === 'inventory'}
                  onClick={() => setActiveTab('inventory')}
                  icon="🎒"
                  label="Inventory"
                />
                <TabButton
                  active={activeTab === 'features'}
                  onClick={() => setActiveTab('features')}
                  icon="⭐"
                  label="Features"
                />
                <TabButton
                  active={activeTab === 'resources'}
                  onClick={() => setActiveTab('resources')}
                  icon="⚡"
                  label="Resources"
                />
                {character.spellcasting && (
                  <TabButton
                    active={activeTab === 'spells'}
                    onClick={() => setActiveTab('spells')}
                    icon="✨"
                    label="Spells"
                  />
                )}
              </div>

              {/* Tab Content */}
              <div
                className="relative bg-wood-texture border-4 border-dnd-accent/70 rounded-lg p-8 flex items-center justify-center shadow-medieval overflow-hidden"
                style={{ height: '400px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                <OrnateCorner position="top-left" />
                <OrnateCorner position="top-right" />
                <OrnateCorner position="bottom-left" />
                <OrnateCorner position="bottom-right" />
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  {renderTabContent()}
                </motion.div>
              </div>
            </div>

            {/* Right Sidebar - Rest Buttons */}
            <div className="col-span-2 space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShortRest}
                className="relative w-full py-4 bg-wood-texture border-4 border-blue-600/80 rounded-lg text-white font-medieval font-semibold hover:border-blue-400 transition-colors shadow-medieval overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-blue-950/80" />
                <div className="relative z-10">
                  <div className="text-2xl mb-1">☕</div>
                  <div className="text-sm drop-shadow-lg">Short Rest</div>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLongRest}
                className="relative w-full py-4 bg-wood-texture border-4 border-purple-600/80 rounded-lg text-white font-medieval font-semibold hover:border-purple-400 transition-colors shadow-medieval overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-purple-950/80" />
                <div className="relative z-10">
                  <div className="text-2xl mb-1">🛏️</div>
                  <div className="text-sm drop-shadow-lg">Long Rest</div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD - Resources & HP */}
      <div className="mt-4">
        {/* Resources Bar - Hotbar only (resources with max <= 6) */}
        <div className="relative bg-wood-texture border-t-4 border-dnd-accent/60 px-6 py-3 shadow-medieval">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto flex items-center gap-3">
            {hotbarResources.map((resource) => (
              <div key={resource.name} className="flex-1">
                <ResourceTracker
                  name={resource.name}
                  icon={resource.icon}
                  current={resource.current}
                  max={resource.max}
                  color="blue"
                  displayType={resource.displayType}
                  rechargeOn={resource.rechargeOn}
                  onUpdate={(newCurrent) => handleResourceUpdate(resource.name, newCurrent)}
                />
              </div>
            ))}
            {/* Spell Slots */}
            {character.spellcasting?.spellSlots
              .filter((slot) => slot.max > 0)
              .map((slot) => (
                <SpellSlotTracker
                  key={slot.level}
                  level={slot.level}
                  max={slot.max}
                  used={slot.used}
                  onUpdate={(newUsed) => handleSpellSlotUpdate(slot.level, newUsed)}
                />
              ))}
          </div>
        </div>

        {/* HP Bar & AC Shield */}
        <div className="relative bg-wood-texture border-t-4 border-dnd-accent/60 px-6 py-4 shadow-medieval">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
          <div className="relative z-10 max-w-7xl mx-auto flex items-center gap-6">
            {/* AC Shield */}
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-28 bg-wood-texture rounded-lg border-4 border-dnd-accent flex flex-col items-center justify-center shadow-medieval overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-900/80" />
                <div className="relative z-10 text-xs text-gray-400 uppercase font-bold font-medieval">AC</div>
                <div className="relative z-10 text-4xl font-bold text-dnd-accent drop-shadow-lg">
                  {character.armorClass}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  <span className="font-medieval text-xl text-white drop-shadow-lg">Hit Points</span>
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
                    <div className="text-sm text-gray-400">/ {character.hitPoints.max}</div>
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
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex-1 py-3 rounded-lg border-3 font-medieval font-semibold transition-colors overflow-hidden ${
        active
          ? 'bg-dnd-accent text-dnd-bg border-dnd-accent shadow-medieval'
          : 'bg-wood-texture text-white border-dnd-accent/50 hover:border-dnd-accent shadow-lg'
      }`}
    >
      {!active && <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/90" />}
      <span className="relative z-10 mr-2">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

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
    <div className="flex items-center justify-between bg-black/40 rounded border border-dnd-accent/30 px-2 py-1 shadow-sm">
      <span className="text-xs text-gray-300 uppercase font-bold font-medieval">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">{score}</span>
        <span className="text-sm text-dnd-accent font-semibold">
          {modifier >= 0 ? '+' : ''}
          {modifier}
        </span>
      </div>
    </div>
  );
}

function StatLineCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-black/40 rounded border border-dnd-accent/30 px-2 py-1 shadow-sm">
      <span className="text-xs text-gray-300 uppercase font-bold font-medieval">{label}</span>
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

function SpellSlotTracker({
  level,
  max,
  used,
  onUpdate,
}: {
  level: number;
  max: number;
  used: number;
  onUpdate: (newUsed: number) => void;
}) {
  const available = max - used;

  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <div className="text-[10px] text-purple-400 font-bold font-medieval uppercase">
        Level {level}
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => {
          const isUsed = i < used;
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(isUsed ? i : i + 1)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                isUsed
                  ? 'bg-gray-700 border-gray-600 opacity-40'
                  : 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400 shadow-lg shadow-purple-500/50'
              }`}
            >
              <span className="text-[10px]">✨</span>
            </motion.button>
          );
        })}
      </div>
      <div className="text-[10px] text-gray-400">
        {available}/{max}
      </div>
    </div>
  );
}

function OrnateCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-8 h-8 pointer-events-none z-20`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 0 L12 0 L8 4 L12 8 L8 12 L4 8 L0 12 Z"
          fill="currentColor"
          className="text-dnd-accent opacity-80"
        />
        <path
          d="M0 0 L8 0 L5 3 L8 6 L5 9 L3 6 L0 9 Z"
          fill="currentColor"
          className="text-dnd-accent opacity-50"
        />
      </svg>
    </div>
  );
}

export default CharacterHUD;
