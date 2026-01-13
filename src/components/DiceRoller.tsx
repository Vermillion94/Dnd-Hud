import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DiceRollerProps {
  onClose: () => void;
}

type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface Roll {
  dice: DiceType;
  count: number;
  modifier: number;
  result: number;
  rolls: number[];
}

function DiceRoller({ onClose }: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState<DiceType>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [history, setHistory] = useState<Roll[]>([]);
  const [rolling, setRolling] = useState(false);

  const rollDice = (die: DiceType, count: number): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * die) + 1);
  };

  const handleRoll = () => {
    setRolling(true);

    setTimeout(() => {
      const rolls = rollDice(selectedDice, diceCount);
      const sum = rolls.reduce((a, b) => a + b, 0);
      const result = sum + modifier;

      const newRoll: Roll = {
        dice: selectedDice,
        count: diceCount,
        modifier,
        result,
        rolls,
      };

      setHistory([newRoll, ...history.slice(0, 9)]);
      setRolling(false);
    }, 500);
  };

  const diceOptions: DiceType[] = [4, 6, 8, 10, 12, 20, 100];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dnd-card rounded-lg p-6 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medieval text-dnd-accent">Dice Roller</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Dice Selection */}
          <div className="space-y-6">
            {/* Dice Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Select Dice
              </label>
              <div className="grid grid-cols-4 gap-2">
                {diceOptions.map((die) => (
                  <motion.button
                    key={die}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDice(die)}
                    className={`p-3 rounded-lg font-bold transition-all ${
                      selectedDice === die
                        ? 'bg-dnd-accent text-dnd-bg'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    d{die}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Number of Dice
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:border-dnd-accent outline-none"
              />
            </div>

            {/* Modifier */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Modifier
              </label>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:border-dnd-accent outline-none"
              />
            </div>

            {/* Roll Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRoll}
              disabled={rolling}
              className="w-full py-4 bg-dnd-accent text-dnd-bg font-bold text-xl rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {rolling ? 'Rolling...' : 'Roll Dice 🎲'}
            </motion.button>

            {/* Current Roll Display */}
            <div className="text-center text-sm text-gray-400">
              {diceCount}d{selectedDice}
              {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
            </div>
          </div>

          {/* Right Column - History */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Roll History
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No rolls yet. Click "Roll Dice" to start!
                  </div>
                ) : (
                  history.map((roll, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          {roll.count}d{roll.dice}
                          {roll.modifier !== 0 &&
                            ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                        </span>
                        <span className="text-3xl font-bold text-dnd-accent">
                          {roll.result}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {roll.rolls.map((r, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded text-xs ${
                              r === roll.dice
                                ? 'bg-green-600 text-white font-bold'
                                : r === 1
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                        {roll.modifier !== 0 && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                            {roll.modifier >= 0 ? '+' : ''}
                            {roll.modifier}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DiceRoller;
