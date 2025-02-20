export function ProgressTracker({ steps, currentStep }) {
  return (
    <div className="flex justify-between">
      {steps.map((step, index) => (
        <div key={step} className={`step ${index <= currentStep ? 'active' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  );
} 