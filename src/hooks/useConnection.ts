import { useContext } from 'react';
import { ConnectionContext } from '../contexts/ConnectionContext';

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
