import React from 'react';

const OfflineOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white">Server Offline</h2>
      </div>
    </div>
  );
};

export default OfflineOverlay;
