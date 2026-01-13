import { motion } from 'framer-motion';
import { Character } from '../types/character';

interface RestPanelProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

function RestPanel({ character, onCharacterUpdate }: RestPanelProps) {
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
    };
    onCharacterUpdate(updatedCharacter);
  };

  const getShortRestResources = () => {
    return character.resources.filter(
      (r) => r.rechargeOn === 'short-rest' && r.current < r.max
    );
  };

  const getLongRestResources = () => {
    return character.resources.filter((r) => r.current < r.max);
  };

  const shortRestResources = getShortRestResources();
  const longRestResources = getLongRestResources();
  const needsHealing = character.hitPoints.current < character.hitPoints.max;

  return (
    <div className="bg-dnd-card rounded-lg p-6">
      <h3 className="text-xl font-medieval text-dnd-accent mb-4">Rest</h3>

      <div className="space-y-4">
        {/* Short Rest */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShortRest}
          disabled={shortRestResources.length === 0}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            shortRestResources.length > 0
              ? 'bg-blue-900/30 border-blue-600 hover:bg-blue-900/50 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold text-lg mb-1">Short Rest</h4>
              <p className="text-sm opacity-80">
                {shortRestResources.length > 0
                  ? `Restore ${shortRestResources.length} resource${
                      shortRestResources.length !== 1 ? 's' : ''
                    }`
                  : 'All resources full'}
              </p>
            </div>
            <div className="text-3xl">☕</div>
          </div>
          {shortRestResources.length > 0 && (
            <div className="mt-2 text-xs opacity-70 text-left">
              {shortRestResources.map((r) => r.name).join(', ')}
            </div>
          )}
        </motion.button>

        {/* Long Rest */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLongRest}
          disabled={!needsHealing && longRestResources.length === 0}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            needsHealing || longRestResources.length > 0
              ? 'bg-purple-900/30 border-purple-600 hover:bg-purple-900/50 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold text-lg mb-1">Long Rest</h4>
              <p className="text-sm opacity-80">
                {needsHealing || longRestResources.length > 0
                  ? 'Restore all HP and resources'
                  : 'Fully rested'}
              </p>
            </div>
            <div className="text-3xl">🛏️</div>
          </div>
          {(needsHealing || longRestResources.length > 0) && (
            <div className="mt-2 text-xs opacity-70 text-left">
              {needsHealing && `HP: ${character.hitPoints.current}/${character.hitPoints.max}`}
              {needsHealing && longRestResources.length > 0 && ' • '}
              {longRestResources.length > 0 &&
                `${longRestResources.length} resource${
                  longRestResources.length !== 1 ? 's' : ''
                }`}
            </div>
          )}
        </motion.button>

        {/* Rest Info */}
        <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded">
          <p className="mb-1">
            <span className="font-semibold">Short Rest:</span> Restores resources marked for
            short/long rest
          </p>
          <p>
            <span className="font-semibold">Long Rest:</span> Fully restores HP and all resources
          </p>
        </div>
      </div>
    </div>
  );
}

export default RestPanel;
