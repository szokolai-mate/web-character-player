import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { CharacterType, CharacterSettings } from './character/types';

//TODO: messenger pattern (e.g. for character.playAnimation)

export const useCharacterStore = create(
    persist(
        //TODO: refactor for readability
        combine(
            {
                // ====================================
                // 1. Initial State
                // ====================================
                isPanelOpen: false,
                characters: [
                    {
                        id: 1,
                        name: 'Miku',
                        url: 'assets/HatsuneMikuNT.vrm',
                        settings: {
                            position: [0, 0, 0],
                            scale: 1,
                            visible: true,
                        },
                    },
                    {
                        id: 2,
                        name: 'jane v0',
                        url: 'assets/Untitled imp.vrm',
                        settings: {
                            position: [2, 0, 0],
                            scale: 1.2,
                            visible: true,
                            activeAnimations: [
                                {
                                    url: 'assets/animation/action_run.bvh',
                                },
                                {
                                    url: 'assets/animation/exercise_jumping_jacks.bvh',
                                },
                            ],
                        },
                    },
                    {
                        id: 3,
                        name: 'jane v1',
                        url: 'assets/janedoev1.vrm',
                        settings: {
                            position: [-2, 0, 0],
                            scale: 1,
                            visible: true,
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
                toggleVisibility: (id: number) =>
                    set((state) => ({
                        characters: state.characters.map((char) =>
                            char.id === id
                                ? {
                                    ...char,
                                    settings: { ...char.settings, visible: !char.settings.visible },
                                }
                                : char,
                        ),
                    })),
                updateAnimations: (id: number, json: any) =>
                    set((state) => ({
                        characters: state.characters.map((char) =>
                            char.id === id
                                ? { ...char, settings: { ...char.settings, activeAnimations: json } }
                                : char,
                        ),
                    })),
                setAvailableExpressions: (id: number, expressions: string[]) =>
                    set((state) => ({
                        characters: state.characters.map((char) =>
                            char.id === id ? { ...char, availableExpressions: expressions } : char,
                        ),
                    })),
                updateExpression: (id: number, name: string, value: number) =>
                    set((state) => ({
                        characters: state.characters.map((char) => {
                            if (char.id !== id) return char;
                            const newExpressions = { ...(char.settings.activeExpressions || {}), [name]: value };
                            return {
                                ...char,
                                settings: { ...char.settings, activeExpressions: newExpressions },
                            };
                        }),
                    })),
                removeCharacter: (id: number) =>
                    set((state) => ({
                        characters: state.characters.filter((char) => char.id !== id),
                    })),
                togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
                importState: (newState: any) => {
                    set(newState);
                },
            }),
        ),
        {
            name: 'character-settings-storage', // unique name
        },
    ),
);
