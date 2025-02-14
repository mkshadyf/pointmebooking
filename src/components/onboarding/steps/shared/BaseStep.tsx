import { ReactNode } from 'react';
import { StepButton } from './StepButton';
import { StepWrapper } from './StepWrapper';

interface BaseStepProps {
  title: string;
  description: string;
  isLoading?: boolean;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  children: ReactNode;
}

export function BaseStep({
  title,
  description,
  isLoading = false,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  children
}: BaseStepProps) {
  return (
    <StepWrapper
      title={title}
      description={description}
    >
      <div className="space-y-6">
        {children}

        <div className="flex justify-between pt-6">
          {onBack && (
            <StepButton
              type="button"
              isLoading={isLoading}
              onClick={onBack}
            >
              {backLabel}
            </StepButton>
          )}

          <StepButton
            type="submit"
            isLoading={isLoading}
            onClick={onNext}
            className={onBack ? 'ml-auto' : ''}
          >
            {nextLabel}
          </StepButton>
        </div>
      </div>
    </StepWrapper>
  );
} 