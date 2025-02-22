export interface ProgressTrackerProps {
  steps: string[];
  currentStep: number;
}

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  return (
    <div className="flex justify-between">
      {steps.map((step: string, index: number) => (
        <div key={step} className={`step ${index <= currentStep ? 'active' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  );
} 