import CharacterSettings from '../character/CharacterSettings';
import './ControlPanel.css';
import { useCharacterStore } from '../store';



export default function ControlPanel() {
    const characters = useCharacterStore((state) => state.characters);
    return (
        <div className="control-panel">
            <h2>Character Controls</h2>
            {characters.map((character) => (
                <CharacterSettings
                    key={character.id}
                    characterId={character.id}
                />
            ))}
            {/* A button to add new characters could go here in the future */}
        </div>
    );
}
