import CharacterSettings from '../character/CharacterSettings';
import './ControlPanel.css';
import { useCharacterStore } from '../store';
import { useShallow } from 'zustand/shallow';
import React from 'react';

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

function ImportExportButtons() {
    const importState = useCharacterStore((state) => state.importState);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const state = useCharacterStore.getState();
        const stateJson = JSON.stringify(state, null, 2);
        const blob = new Blob([stateJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'character-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') return;
                const newState = JSON.parse(text);
                importState(newState);
            } catch (error) {
                console.error('Error parsing JSON file!', error);
                alert('Failed to import settings: Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="import-export-buttons">
            <button onClick={handleExport} className="panel-header-button">
                📤 Export
            </button>
            <button onClick={handleImportClick} className="panel-header-button">
                📥 Import
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default function ControlPanel() {
    const characters = useCharacterStore((state) => state.characters);
    const isPanelOpen = useCharacterStore((state) => state.isPanelOpen);
    return (
        <div className={`control-panel ${isPanelOpen ? '' : 'closed'}`}>
            <PanelToggleButton />
            <div className="panel-header">
                <ImportExportButtons />
                <h2>Character Controls</h2>
            </div>
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
