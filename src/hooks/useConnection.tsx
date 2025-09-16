import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface ConnectionContextType {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setOnline] = useState(true);
  const value = useMemo(() => ({ isOnline, setOnline }), [isOnline]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
