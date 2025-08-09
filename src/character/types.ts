export interface CharacterSettings {
  position: [number, number, number];
  scale: number;
}

export interface CharacterType {
  id: number;
  name: string;
  url: string;
  settings: CharacterSettings;
}
