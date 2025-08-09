import CharacterSettings from '../character/CharacterSettings';
import './ControlPanel.css';
import { useCharacterStore } from '../store';
import { useShallow } from 'zustand/shallow';

function PanelToggleButton() {
    const { isPanelOpen, togglePanel } = useCharacterStore(
        useShallow((state) => ({
            isPanelOpen: state.isPanelOpen,
            togglePanel: state.togglePanel,
        })),
    );

    return (
        <button
            className={`panel-toggle-button ${isPanelOpen ? 'open' : ''}`}
            onClick={togglePanel}
            title={isPanelOpen ? 'Close Panel' : 'Open Panel'}
        >
            <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </button>
    );
}

export default function ControlPanel() {
    const characters = useCharacterStore((state) => state.characters);
    const isPanelOpen = useCharacterStore((state) => state.isPanelOpen);
    return (
        <div className={`control-panel ${isPanelOpen ? '' : 'closed'}`}>
            <PanelToggleButton />
            <h2>Character Controls</h2>
            {/* Using a separate div for scrolling content */}
            <div className="panel-content">
                {characters.map((character) => (
                    <CharacterSettings
                        key={character.id}
                        characterId={character.id}
                    />
                ))}
            </div>
        </div>
    );
}
