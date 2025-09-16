import { createContext, useContext } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';

export type GameEngineContextType = ReturnType<typeof useGameEngine> | null;

export const GameContext = createContext<GameEngineContextType>(null);

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};
