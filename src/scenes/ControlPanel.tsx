import React from 'react';
import CharacterSettings from '../character/CharacterSettings';
import { CharacterType } from '../types';
import './ControlPanel.css';


interface ControlPanelProps {
    characters: CharacterType[];
    setCharacters: React.Dispatch<React.SetStateAction<CharacterType[]>>;
}

export default function ControlPanel({ characters, setCharacters }: ControlPanelProps) {
    return (
        <div className="control-panel">
        <h2>Character Controls</h2>
        {characters.map((character) => (
            <CharacterSettings
            key={character.id}
            character={character}
            setCharacters={setCharacters}
            />
        ))}
        {/* A button to add new characters could go here in the future */}
        </div>
    );
}