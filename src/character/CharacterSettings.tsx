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
    const { updateSetting, updatePosition, removeCharacter, toggleVisibility } = useCharacterStore.getState();

    if (!character) {
        return null;
    }

    return (
        <div className="character-settings-card">
            <h4>
                <span>{character.name}</span>
                <div className="title-buttons">
                    <button
                        onClick={() => toggleVisibility(character.id)}
                        className="visibility-button"
                        title={character.settings.visible ? 'Hide' : 'Show'}
                    >
                        {character.settings.visible ? '👁️' : '🙈'}
                    </button>
                    <button
                        onClick={() => removeCharacter(character.id)}
                        className="remove-button"
                        title="Remove Character"
                    >
                        &ndash;
                    </button>
                </div>
            </h4>
            <div className="control-row">
                <label>Scale</label>
                <div className="input-group">
                    <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.05"
                        value={character.settings.scale}
                        onChange={(e) => updateSetting(characterId, 'scale', parseFloat(e.target.value))}
                    />
                    <input
                        type="number"
                        min="0.1"
                        max="3"
                        step="0.05"
                        value={character.settings.scale}
                        onChange={(e) => updateSetting(characterId, 'scale', parseFloat(e.target.value))}
                        className="number-input"
                    />
                </div>
            </div>

            {/* Position Controls */}
            <div className="control-row">
                <label>Position X</label>
                <div className="input-group">
                    <input
                        type="range"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[0]}
                        onChange={(e) => updatePosition(characterId, 0, parseFloat(e.target.value))}
                    />
                    <input
                        type="number"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[0]}
                        onChange={(e) => updatePosition(characterId, 0, parseFloat(e.target.value))}
                        className="number-input"
                    />
                </div>
            </div>
            <div className="control-row">
                <label>Position Y</label>
                <div className="input-group">
                    <input
                        type="range"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[1]}
                        onChange={(e) => updatePosition(characterId, 1, parseFloat(e.target.value))}
                    />
                    <input
                        type="number"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[1]}
                        onChange={(e) => updatePosition(characterId, 1, parseFloat(e.target.value))}
                        className="number-input"
                    />
                </div>
            </div>
            <div className="control-row">
                <label>Position Z</label>
                <div className="input-group">
                    <input
                        type="range"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[2]}
                        onChange={(e) => updatePosition(characterId, 2, parseFloat(e.target.value))}
                    />
                    <input
                        type="number"
                        min={-5}
                        max={5}
                        step="0.1"
                        value={character.settings.position[2]}
                        onChange={(e) => updatePosition(characterId, 2, parseFloat(e.target.value))}
                        className="number-input"
                    />
                </div>
            </div>
        </div>
    );
}

export default React.memo(CharacterSettings);
