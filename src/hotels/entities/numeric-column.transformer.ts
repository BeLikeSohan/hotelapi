import { ValueTransformer } from 'typeorm';

export const numericColumnTransformer: ValueTransformer = {
  to: (value?: number | null): number | null | undefined => value,
  from: (value?: string | number | null): number | null | undefined => {
    if (value === null || value === undefined || typeof value === 'number') {
      return value;
    }

    return Number(value);
  },
};
