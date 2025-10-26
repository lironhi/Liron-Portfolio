import { fsAdapter } from './fsAdapter';
import type { DataProvider } from './provider';

export const data: DataProvider = fsAdapter;

export * from './types';
export * from './provider';