interface StepButtonProps {
  isLoading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function StepButton({
  isLoading,
  type = 'submit',
  onClick,
  children,
  className
}: StepButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
} 