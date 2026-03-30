import * as React from 'react';

export const MetricsCard: React.FC<{
  name: string;
  unit: string;
  value: string;
}> = ({ name, unit, value }) => {
  return (
    <div
      className={
        'flex flex-col items-center justify-center lg:gap-2 border border-gray-300 rounded-2xl lg:w-30 lg:h-30 max-md:w-22 max-md:h-22'
      }
    >
      <div className={'text-gray-500'}>{name}</div>
      <div className={'text-3xl'}>{value}</div>
      <div className={'text-gray-500'}>{unit}</div>
    </div>
  );
};
