import { motion } from 'framer-motion';
import { useState } from 'react';

interface ResourceTrackerProps {
  name: string;
  icon: string;
  current: number;
  max: number;
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  displayType: 'slots' | 'number' | 'bar';
  rechargeOn?: 'short-rest' | 'long-rest' | 'dawn' | 'manual' | 'none';
  onUpdate: (newCurrent: number) => void;
}

const colorClasses = {
  red: {
    bg: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-red-400',
    glow: 'shadow-red-500/50',
  },
  blue: {
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/50',
  },
  green: {
    bg: 'bg-green-600',
    border: 'border-green-600',
    text: 'text-green-400',
    glow: 'shadow-green-500/50',
  },
  purple: {
    bg: 'bg-purple-600',
    border: 'border-purple-600',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/50',
  },
  orange: {
    bg: 'bg-orange-600',
    border: 'border-orange-600',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/50',
  },
};

function ResourceTracker({
  name,
  icon,
  current,
  max,
  color,
  displayType,
  rechargeOn,
  onUpdate,
}: ResourceTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const colors = colorClasses[color];

  const handleIncrement = () => {
    if (current < max) {
      onUpdate(current + 1);
    }
  };

  const handleDecrement = () => {
    if (current > 0) {
      onUpdate(current - 1);
    }
  };

  const percentage = (current / max) * 100;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-white">{name}</h4>
            {rechargeOn && rechargeOn !== 'none' && (
              <p className="text-xs text-gray-400">
                Recharges on {rechargeOn.replace('-', ' ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={current <= 0}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white font-bold"
          >
            −
          </button>
          <span
            className={`text-xl font-bold ${colors.text} min-w-[60px] text-center cursor-pointer`}
            onClick={() => setIsEditing(true)}
          >
            {isEditing ? (
              <input
                type="number"
                value={current}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdate(Math.max(0, Math.min(val, max)));
                }}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditing(false);
                }}
                className="w-16 bg-gray-800 text-center rounded px-1"
                autoFocus
              />
            ) : (
              `${current} / ${max}`
            )}
          </span>
          <button
            onClick={handleIncrement}
            disabled={current >= max}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Display Types */}
      {displayType === 'bar' && (
        <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`h-full ${colors.bg} rounded-full ${colors.glow} shadow-lg`}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {current} / {max}
          </div>
        </div>
      )}

      {displayType === 'slots' && (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: max }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (index < current) {
                  onUpdate(index);
                } else {
                  onUpdate(index + 1);
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-lg border-2 ${
                index < current
                  ? `${colors.bg} ${colors.border} ${colors.glow} shadow-lg`
                  : 'bg-gray-800 border-gray-700'
              } transition-all duration-200 flex items-center justify-center`}
            >
              {index < current && <span className="text-lg">{icon}</span>}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceTracker;
