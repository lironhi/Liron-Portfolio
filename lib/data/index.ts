import { fsAdapter } from './fsAdapter';
import type { DataProvider } from './provider';

export const data: DataProvider = fsAdapter;

export * from './provider';
export * from './types';
