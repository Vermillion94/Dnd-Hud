import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Character, CharacterSpell } from '../types/character';

interface SpellManagerProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

function SpellManager({ character, onCharacterUpdate }: SpellManagerProps) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  if (!character.spellcasting) {
    return null;
  }

  const { spellcasting } = character;

  const handleUseSpellSlot = (level: number) => {
    if (!character.spellcasting) return;

    const updatedSlots = character.spellcasting.spellSlots.map((slot) =>
      slot.level === level && slot.used < slot.max
        ? { ...slot, used: slot.used + 1 }
        : slot
    );

    onCharacterUpdate({
      ...character,
      spellcasting: {
        ...character.spellcasting,
        spellSlots: updatedSlots,
      },
    });
  };

  const handleRestoreSpellSlot = (level: number) => {
    if (!character.spellcasting) return;

    const updatedSlots = character.spellcasting.spellSlots.map((slot) =>
      slot.level === level && slot.used > 0 ? { ...slot, used: slot.used - 1 } : slot
    );

    onCharacterUpdate({
      ...character,
      spellcasting: {
        ...character.spellcasting,
        spellSlots: updatedSlots,
      },
    });
  };

  const handleTogglePrepared = (spellName: string) => {
    if (!character.spellcasting) return;

    const updatedSpells = character.spellcasting.knownSpells.map((spell) =>
      spell.name === spellName ? { ...spell, prepared: !spell.prepared } : spell
    );

    onCharacterUpdate({
      ...character,
      spellcasting: {
        ...character.spellcasting,
        knownSpells: updatedSpells,
      },
    });
  };

  const spellsByLevel = spellcasting.knownSpells.reduce((acc, spell) => {
    if (!acc[spell.level]) acc[spell.level] = [];
    acc[spell.level].push(spell);
    return acc;
  }, {} as Record<number, CharacterSpell[]>);

  const filteredSpells =
    filterLevel === 'all'
      ? spellcasting.knownSpells
      : spellsByLevel[filterLevel] || [];

  const maxSpellLevel = Math.max(...spellcasting.spellSlots.map((s) => s.level));

  return (
    <div className="bg-dnd-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medieval text-dnd-accent">Spellcasting</h3>
        <div className="text-sm text-gray-400">
          <span className="font-semibold">Save DC:</span> {spellcasting.spellSaveDC} •{' '}
          <span className="font-semibold">Attack:</span> +{spellcasting.spellAttackBonus}
        </div>
      </div>

      {/* Spell Slots */}
      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Spell Slots
        </h4>
        {spellcasting.spellSlots.map((slot) => {
          const available = slot.max - slot.used;
          return (
            <div key={slot.level} className="flex items-center gap-3">
              <div className="w-20 text-sm font-semibold text-gray-300">
                Level {slot.level}
              </div>
              <div className="flex gap-2 flex-1 flex-wrap">
                {Array.from({ length: slot.max }).map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      if (index < available) {
                        handleUseSpellSlot(slot.level);
                      } else {
                        handleRestoreSpellSlot(slot.level);
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      index < available
                        ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <span className="text-lg">
                      {index < available ? '✨' : ''}
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="text-sm text-gray-400 w-16 text-right">
                {available}/{slot.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spell Level Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterLevel('all')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filterLevel === 'all'
              ? 'bg-dnd-accent text-dnd-bg font-semibold'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterLevel(0)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filterLevel === 0
              ? 'bg-dnd-accent text-dnd-bg font-semibold'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Cantrips
        </button>
        {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterLevel === level
                ? 'bg-dnd-accent text-dnd-bg font-semibold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Level {level}
          </button>
        ))}
      </div>

      {/* Spells List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSpells.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No spells at this level</p>
        ) : (
          filteredSpells.map((spell) => (
            <motion.div
              key={spell.name}
              layout
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                spell.prepared
                  ? 'border-dnd-accent bg-dnd-accent/10'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div
                className="p-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() =>
                  setExpandedSpell(expandedSpell === spell.name ? null : spell.name)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{spell.name}</h4>
                      {spell.concentration && (
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                          C
                        </span>
                      )}
                      {spell.ritual && (
                        <span className="text-xs bg-purple-600 px-2 py-0.5 rounded">
                          R
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {spell.level > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePrepared(spell.name);
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          spell.prepared
                            ? 'bg-dnd-accent text-dnd-bg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {spell.prepared ? 'Prepared' : 'Prepare'}
                      </button>
                    )}
                    <span className="text-gray-400">
                      {expandedSpell === spell.name ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSpell === spell.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-700"
                  >
                    <div className="p-3 space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-300">Casting Time:</span>{' '}
                        <span className="text-gray-400">{spell.castingTime}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Range:</span>{' '}
                        <span className="text-gray-400">{spell.range}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Components:</span>{' '}
                        <span className="text-gray-400">{spell.components}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Duration:</span>{' '}
                        <span className="text-gray-400">{spell.duration}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-gray-300">{spell.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default SpellManager;
