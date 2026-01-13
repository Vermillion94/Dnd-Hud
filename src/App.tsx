import { useState, useEffect } from 'react';
import CharacterHUD from './components/CharacterHUD';
import { Character } from './types/character';
import {
  importCharacter,
  exportCharacter,
  loadExampleCharacter,
} from './utils/fileImportExport';
import {
  saveCharacterToStorage,
  loadCharacterFromStorage,
  setupAutoSave,
} from './utils/localStorage';

function App() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load character from local storage on mount
  useEffect(() => {
    const stored = loadCharacterFromStorage();
    if (stored) {
      setCharacter(stored);
    }
    setLoading(false);
  }, []);

  // Setup auto-save
  useEffect(() => {
    if (!character) return;

    const cleanup = setupAutoSave(() => character);
    return cleanup;
  }, [character]);

  // Save to local storage whenever character changes
  useEffect(() => {
    if (character) {
      saveCharacterToStorage(character);
    }
  }, [character]);

  const handleImport = async () => {
    try {
      setError(null);
      const imported = await importCharacter();
      setCharacter(imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import character');
    }
  };

  const handleLoadExample = async () => {
    try {
      setError(null);
      const example = await loadExampleCharacter();
      setCharacter(example);
    } catch (err) {
      setError('Failed to load example character');
    }
  };

  const handleExport = () => {
    if (character) {
      exportCharacter(character);
    }
  };

  const handleNewCharacter = () => {
    setCharacter(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dnd-bg flex items-center justify-center">
        <div className="text-dnd-accent text-2xl font-medieval">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dnd-bg">
      {character ? (
        <div>
          {/* Header Actions */}
          <div className="bg-dnd-card border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h2 className="text-xl font-medieval text-dnd-accent">
                D&D Character HUD
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Export Character
                </button>
                <button
                  onClick={handleNewCharacter}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  New Character
                </button>
              </div>
            </div>
          </div>
          <CharacterHUD character={character} onCharacterUpdate={setCharacter} />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 max-w-2xl">
            <h1 className="text-5xl font-medieval text-dnd-accent mb-4">
              D&D Character HUD
            </h1>
            <p className="text-gray-300 mb-2">
              A dynamic, visual character sheet for your D&D adventures
            </p>
            <p className="text-gray-400 mb-8 text-sm">
              System-agnostic • JSON-driven • Offline-capable
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={handleImport}
                className="px-8 py-4 bg-dnd-accent text-dnd-bg font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-lg"
              >
                Import Character
              </button>
              <button
                onClick={handleLoadExample}
                className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Load Example Character
              </button>
            </div>

            <div className="mt-12 text-left bg-dnd-card p-6 rounded-lg">
              <h3 className="text-xl font-medieval text-dnd-accent mb-3">
                Getting Started
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Import a character JSON file to begin</li>
                <li>• Or load the example character to see how it works</li>
                <li>• Character data is saved automatically as you play</li>
                <li>• Export your character anytime for backup or sharing</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
