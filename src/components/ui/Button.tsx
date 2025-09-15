import React from 'react';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'px-8 py-3 font-bold rounded-full text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900';

  const variantClasses = {
    primary: 'bg-[var(--color-accent-600)] text-white hover:bg-[var(--color-accent-500)] focus:ring-[var(--color-accent-500)]',
    secondary: 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600 focus:ring-neutral-500',
  };

  const disabledClasses = 'disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className} relative`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent border-[var(--color-accent-200)] rounded-full animate-spin"></div>
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

export default Button;
