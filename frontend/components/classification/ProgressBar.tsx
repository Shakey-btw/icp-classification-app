'use client';

import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Field className="w-[40%]" style={{ minWidth: '140px' }}>
      <FieldLabel htmlFor="classification-progress" style={{ fontSize: '12px', marginBottom: '-4px', color: '#000000', fontWeight: '400' }}>
        <span>Progress</span>
        <span className="ml-auto">{current} / {total}</span>
      </FieldLabel>
      <Progress value={percentage} id="classification-progress" className="h-1.5" />
    </Field>
  );
}
