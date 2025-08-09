import React from 'react';
import { useCharacterStore } from '../store';
import { useShallow } from 'zustand/shallow';

interface CharacterSettingsProps {
  characterId: number;
}

function CharacterSettings({ characterId }: CharacterSettingsProps) {
    const character = useCharacterStore(
        useShallow((state) => state.characters.find((char) => char.id === characterId)!));

    // Select the actions from the store
    const { updateSetting, updatePosition } = useCharacterStore.getState();

    if (!character) {
        return null;
    }

    return (
        <div className="character-settings-card">
            <h4>{character.name}</h4>
            <div className="control-row">
                <label>Scale</label>
                <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.05"
                    value={character.settings.scale}
                    onChange={(e) => updateSetting(characterId, 'scale', parseFloat(e.target.value))}
                />
            </div>

            {/* Position Controls */}
            <div className="control-row">
                <label>Position X</label>
                <input
                    type="range"
                    min={-5}
                    max={5}
                    step="0.1"
                    value={character.settings.position[0]}
                    onChange={(e) => updatePosition(characterId, 0, parseFloat(e.target.value))}
                />
            </div>
            <div className="control-row">
                <label>Position Y</label>
                <input
                    type="range"
                    min={-5}
                    max={5}
                    step="0.1"
                    value={character.settings.position[1]}
                    onChange={(e) => updatePosition(characterId, 1, parseFloat(e.target.value))}
                />
            </div>
            <div className="control-row">
                <label>Position Z</label>
                <input
                    type="range"
                    min={-5}
                    max={5}
                    step="0.1"
                    value={character.settings.position[2]}
                    onChange={(e) => updatePosition(characterId, 2, parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
}

export default React.memo(CharacterSettings);
