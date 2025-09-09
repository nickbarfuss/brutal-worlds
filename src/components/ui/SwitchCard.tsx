import React from 'react';
import Switch from '@/components/ui/Switch';

interface SwitchCardProps {
  icon: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SwitchCard: React.FC<SwitchCardProps> = ({ icon, label, description, checked, onChange, disabled }) => {
  return (
    <div className="bg-neutral-800 rounded-lg p-3 flex items-start w-full text-left space-x-4">
      <span className="material-symbols-outlined text-2xl text-neutral-400 p-1 mt-1">
        {icon}
      </span>
      <div className="flex-grow">
        <p className="font-semibold text-gray-200 text-lg">{label}</p>
        {description && <p className="text-sm text-neutral-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 mt-1">
        <Switch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
};

export default SwitchCard;