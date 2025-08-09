import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { CharacterType, CharacterSettings } from './types';

//TODO: zustand/middleware/persist
//TODO: messenger pattern (e.g. for character.playAnimation)

export const useCharacterStore = create(
    //TODO: refactor for readability
    combine(
        {
            // ====================================
            // 1. Initial State
            // ====================================
            characters: [
                {
                    id: 1,
                    name: 'Miku',
                    url: 'assets/HatsuneMikuNT.vrm',
                    settings: {
                        position: [0, 0, 0],
                        scale: 1,
                    },
                },
                {
                    id: 2,
                    name: 'jane v0',
                    url: 'assets/Untitled imp.vrm',
                    settings: {
                        position: [2, 0, 0],
                        scale: 1.2,
                    },
                },
                {
                    id: 3,
                    name: 'jane v1',
                    url: 'assets/janedoev1.vrm',
                    settings: {
                        position: [-2, 0, 0],
                        scale: 1,
                    },
                },
            ] as CharacterType[], // Type assertion on the initial array helps inference
        },
        // ====================================
        // 2. Actions (the function that modifies state)
        // ====================================
        (set) => ({
            updateSetting: (
                id: number,
                setting: keyof Omit<CharacterSettings, 'position'>,
                value: number,
            ) =>
                set((state) => ({
                    characters: state.characters.map((char) =>
                        char.id === id
                            ? { ...char, settings: { ...char.settings, [setting]: value } }
                            : char,
                    ),
                })),

            updatePosition: (id: number, axisIndex: 0 | 1 | 2, value: number) =>
                set((state) => ({
                    characters: state.characters.map((char) => {
                        if (char.id !== id) return char;
                        const newPosition = [...char.settings.position] as [
              number,
              number,
              number]
            ;
                        newPosition[axisIndex] = value;
                        return {
                            ...char,
                            settings: { ...char.settings, position: newPosition },
                        };
                    }),
                })),
        }),
    ),
);
