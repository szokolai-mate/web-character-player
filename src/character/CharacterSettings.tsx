import React from 'react';
import { CharacterType, CharacterSettings as CharacterSettingsType } from '../types';

interface CharacterSettingsProps {
  character: CharacterType;
  setCharacters: React.Dispatch<React.SetStateAction<CharacterType[]>>;
}

export default function CharacterSettings({ character, setCharacters }: CharacterSettingsProps) {
    const handleSettingChange = (
        setting: keyof CharacterSettingsType,
        value: number
    ) => {
        setCharacters((prev) =>
        prev.map((char) =>
            char.id === character.id
            ? {
                ...char,
                settings: { ...char.settings, [setting]: value },
                }
            : char
        )
        );
    };

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSettingChange('scale', parseFloat(e.target.value))
          }
        />
      </div>
      {/* Add more controls for position, etc. following the same pattern */}
    </div>
  );
}
