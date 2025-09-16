import { createContext } from 'react';

export interface ConnectionContextType {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
}

export const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);
