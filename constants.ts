
import { System } from './types';

export const SYSTEMS = [System.Megajet, System.Grassilli, System.MegajetScope];

export const EQUIPMENT_IDS: { [key in System]: string[] } = {
  [System.Megajet]: [
    'MJ-LINE-1', 'MJ-LINE-2', 'MJ-LINE-3', 'MJ-LINE-4', 'MJ-LINE-5', 'MJ-LINE-6'
  ],
  [System.Grassilli]: [
    'GR-LINE-1', 'GR-LINE-2', 'GR-LINE-3', 'GR-LINE-4', 'GR-LINE-5', 'GR-LINE-6'
  ],
  [System.MegajetScope]: [
    'SCOPE-L1', 'SCOPE-L2', 'SCOPE-L3', 'SCOPE-L4', 'SCOPE-L5', 'SCOPE-L6'
  ],
};
