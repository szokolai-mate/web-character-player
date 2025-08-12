export interface CharacterSettings {
  position: [number, number, number];
  scale: number;
  visible: boolean;
  activeAnimations: AnimationSettings[];
  activeExpressions?: { [key: string]: number };
}

export interface AnimationSettings {
  url: string;
  //TODO
  // weight: number;
  // timeScale: number;
  //TODO: other parameters
}

export interface CharacterType {
  id: number;
  name: string;
  url: string;
  settings: CharacterSettings;
  availableExpressions?: string[];
}
