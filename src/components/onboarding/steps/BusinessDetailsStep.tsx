'use client';

import { StepInput } from './shared';
import { BaseStep } from './shared/BaseStep';

export interface BusinessDetailsStepProps {
  data: {
    businessName: string;
    businessType: string;
    description: string;
  };
  isLoading?: boolean;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack?: () => void;
}

export function BusinessDetailsStep({
  data,
  isLoading,
  onChange,
  onNext,
  onBack
}: BusinessDetailsStepProps) {
  return (
    <BaseStep
      title="Business Details"
      description="Tell us about your business"
      isLoading={isLoading}
      onNext={onNext}
      onBack={onBack}
    >
      <StepInput
        id="businessName"
        label="Business Name"
        value={data.businessName}
        onChange={(value) => onChange('businessName', value)}
        required
      />

      <StepInput
        id="businessType"
        label="Business Type"
        value={data.businessType}
        onChange={(value) => onChange('businessType', value)}
        required
      />

      <StepInput
        id="description"
        label="Description"
        type="textarea"
        value={data.description}
        onChange={(value) => onChange('description', value)}
        required
      />
    </BaseStep>
  );
}
