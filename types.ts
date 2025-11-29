export enum ImageStyle {
  RUSTIC = 'Rústico/Escuro',
  MODERN = 'Claro/Moderno',
  SOCIAL = 'Social Media (Top View)',
}

export interface MedicineAsset {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  imageUrl?: string;
  style: ImageStyle;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
