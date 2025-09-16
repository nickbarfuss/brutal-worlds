import React, { useState, ReactNode, useMemo } from 'react';
import { ConnectionContext } from '../../contexts/ConnectionContext';

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setOnline] = useState(true);
  const value = useMemo(() => ({ isOnline, setOnline }), [isOnline]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
