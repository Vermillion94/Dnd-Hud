# D&D Character HUD

A dynamic, visual, and animated character management system for D&D - like the inventory menu in an RPG, but for your entire character sheet! Built as a Progressive Web App (PWA) that works on desktop, tablet, and phone.

## Features

### Core Functionality
- **Visual Resource Tracking** - Dynamic HP bars, spell slots, and class features with beautiful animations
- **Inventory Management** - Track items, equipment, gold, and treasure with an intuitive interface
- **Character Information** - Stats, AC, skills, spells, features, and proficiencies at your fingertips
- **Level-Up Wizard** - Baldur's Gate 3 style guided leveling with choices and options from class JSON definitions
- **Spell Management** - Full spellcasting interface for prepared/known spells with spell slot tracking
- **Rest System** - Short/long rest buttons that intelligently restore appropriate resources
- **Dice Roller** - Integrated dice rolling for attacks, saves, and checks with history
- **Auto-Save** - Character data automatically saved to local storage
- **Import/Export** - Portable character files you can share and backup
- **Offline First** - Works without internet after initial load (PWA)
- **System Agnostic** - JSON-driven design means any edition or homebrew system works

### Future Features (Planned)
- **Character Creation Wizard** - Guided character creation from scratch
- **Combat Tracker** - Initiative tracking and combat management
- **Notes & Journal** - Session notes and character journal
- **Party Management** - Manage multiple characters and party composition

## Technology Stack

- **React** + **TypeScript** - Type-safe, modern UI
- **Vite** - Lightning-fast development and builds
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **PWA** - Installable, offline-capable web app

## Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Dnd-Hud

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Using the App

1. **Load a Character**
   - Click "Import Character" to load a character JSON file
   - Or try an example:
     - **⚔️ Fighter Example**: Aldric the Bold (Level 5 Battle Master) - Shows martial combat features
     - **✨ Wizard Example**: Elara Moonwhisper (Level 5 Evocation Wizard) - Shows spellcasting system

2. **Manage Your Character**
   - Update HP by clicking +/- or clicking the number to type
   - Use resources by clicking the slots or adjusting numbers
   - Cast spells and manage spell slots (for spellcasters)
   - Take short/long rests to restore resources
   - Roll dice with the integrated dice roller
   - All changes auto-save to local storage

3. **Level Up Your Character**
   - The class definition is auto-loaded with example characters
   - Click "Level Up" to open the wizard
   - Make choices step-by-step (subclasses, fighting styles, etc.)
   - See what features and resources you gain

4. **Export Your Character**
   - Click "Export Character" to download a JSON file
   - Share this file with others or use it as a backup

## JSON Schema Documentation

### Character Files

Character files (e.g., `aldric.json`) contain a specific character's data - their chosen options, current state, and inventory.

**Example Structure:**
```json
{
  "id": "char-001",
  "name": "Aldric the Bold",
  "className": "Fighter",
  "subclassName": "Battle Master",
  "level": 5,
  "race": "Human",
  "background": "Soldier",

  "abilityScores": {
    "strength": 18,
    "dexterity": 14,
    "constitution": 16,
    "intelligence": 10,
    "wisdom": 12,
    "charisma": 8
  },

  "hitPoints": {
    "current": 42,
    "max": 47,
    "temporary": 0
  },

  "resources": [
    {
      "name": "Second Wind",
      "icon": "❤️‍🩹",
      "current": 1,
      "max": 1,
      "rechargeOn": "short-rest",
      "displayType": "slots"
    }
  ],

  "inventory": {
    "items": [...],
    "currency": {
      "copper": 50,
      "silver": 20,
      "gold": 125,
      "platinum": 2
    }
  }
}
```

**Example Characters Available:**
- `/src/schemas/example-character.json` - Aldric the Bold (Level 5 Battle Master Fighter)
- `/src/schemas/example-wizard.json` - Elara Moonwhisper (Level 5 Evocation Wizard with spells)

### Class Definition Files

Class definition files (e.g., `Fighter.json`) contain ALL possible options for a class - they're the "rulebook" that the level-up wizard uses to present choices.

**Key Concept:** These files include what COULD happen at each level, not what DID happen. A character file tracks the actual choices made.

**Example Structure:**
```json
{
  "name": "Fighter",
  "description": "A master of martial combat...",
  "hitDie": 10,
  "primaryAbility": ["strength", "dexterity"],
  "savingThrows": ["strength", "constitution"],

  "levels": [
    {
      "level": 1,
      "proficiencyBonus": 2,
      "features": [
        {
          "name": "Second Wind",
          "description": "...",
          "type": "resource",
          "grantsResource": {
            "name": "Second Wind",
            "icon": "❤️‍🩹",
            "max": 1,
            "rechargeOn": "short-rest"
          }
        }
      ],
      "choices": [
        {
          "type": "fighting-style",
          "prompt": "Choose your Fighting Style",
          "choose": 1,
          "from": [
            {
              "name": "Archery",
              "description": "You gain a +2 bonus to attack rolls..."
            },
            {
              "name": "Defense",
              "description": "While wearing armor, you gain +1 AC..."
            }
          ]
        }
      ]
    },
    {
      "level": 3,
      "choices": [
        {
          "type": "subclass",
          "prompt": "Choose your Martial Archetype",
          "choose": 1,
          "from": [
            {
              "name": "Battle Master",
              "description": "...",
              "grants": {
                "features": [...],
                "resources": [...]
              }
            },
            {
              "name": "Champion",
              "description": "..."
            }
          ]
        }
      ]
    }
  ]
}
```

**Example Class Definitions Available:**
- `/src/schemas/Fighter.json` - Complete Fighter (1-20) with Battle Master and Champion subclasses
- `/src/schemas/Wizard.json` - Complete Wizard (1-20) with Evocation and Abjuration subclasses, full spellcasting

### Creating Your Own Class Definitions

You can create JSON files for any class from any edition or homebrew system:

1. Copy the structure from `Fighter.json` or `Wizard.json`
2. Fill in your class's features, choices, and progression
3. Include ALL options at each level (subclasses, spells, fighting styles, etc.)
4. Use icons (emojis work great!) for visual flair
5. Save as `YourClass.json`

**Important Notes:**
- **Legal Compliance:** Only create files with content you own or have rights to use
- The app is a tool/viewer - you provide the content
- Share your files responsibly and respect intellectual property

## Resource Icons

Use emojis for resource icons! Some suggestions:

- HP: ❤️, 🩸
- Spell Slots: ✨, 🔮, ⭐
- Ki Points: ⚡, 💫
- Rage: 😡, 🔥
- Bardic Inspiration: 🎵, 🎶
- Channel Divinity: 🙏, ✝️
- Action Surge: ⚡, 💥
- Superiority Dice: 🎲
- Sorcery Points: 🌟
- Wild Shape: 🐺, 🐻

## TypeScript Types

Full TypeScript interfaces are available in:
- `/src/types/character.ts` - Character data structures
- `/src/types/classDefinition.ts` - Class definition structures

## Project Structure

```
Dnd-Hud/
├── src/
│   ├── components/          # React components
│   │   ├── CharacterHUD.tsx
│   │   └── ResourceTracker.tsx
│   ├── types/              # TypeScript definitions
│   │   ├── character.ts
│   │   └── classDefinition.ts
│   ├── utils/              # Utility functions
│   │   ├── fileImportExport.ts
│   │   └── localStorage.ts
│   ├── schemas/            # Example JSON files
│   │   ├── Fighter.json
│   │   └── example-character.json
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
└── package.json          # Dependencies
```

## Development

### Available Scripts

- `npm run dev` - Start development server (hot reload enabled)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Adding New Features

The codebase is structured for easy extension:

1. **New Components** - Add to `/src/components/`
2. **New Types** - Add to `/src/types/`
3. **New Utilities** - Add to `/src/utils/`
4. **New Class Definitions** - Add to `/src/schemas/`

## Deployment

### GitHub Pages (Recommended)

1. Build the project: `npm run build`
2. The `dist/` folder contains your static site
3. Deploy to GitHub Pages, Netlify, Vercel, etc.

### PWA Installation

Once deployed, users can:
- On mobile: Tap "Add to Home Screen"
- On desktop: Look for install prompt in browser
- Works offline after first visit

## Contributing

Contributions are welcome! Please:

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on mobile and desktop
4. Update documentation as needed

## License

This project is a tool/viewer. The code itself is open source.

**Important:** This tool does NOT include any proprietary D&D content. Users are responsible for creating their own class definition files and ensuring they have rights to the content they input.

## Roadmap

### Phase 1 (✅ Complete)
- [x] Basic HUD layout
- [x] Resource tracking with animations
- [x] HP management
- [x] Inventory display
- [x] Import/export functionality
- [x] Local storage and auto-save
- [x] PWA configuration

### Phase 2 (✅ Complete)
- [x] Level-up wizard with class definition integration
- [x] Spell management interface with slot tracking
- [x] Rest system (short/long rest)
- [x] Dice roller with history

### Phase 3 (Coming Soon)
- [ ] Character creation wizard
- [ ] Combat tracker
- [ ] Notes and journal
- [ ] Party management

### Phase 4 (Future)
- [ ] Cloud sync (optional)
- [ ] Homebrew content editor
- [ ] Multi-character party view
- [ ] Campaign management tools

## Acknowledgments

- Inspired by Baldur's Gate 3's character management
- Uses D&D 5E as reference (content not included)
- Built with modern web technologies

## Support

For bugs, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review example files in `/src/schemas/`

---

**Made with ⚔️ for tabletop gamers**