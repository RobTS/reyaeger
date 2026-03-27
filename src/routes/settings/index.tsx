import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import cx from 'classnames';
import {
  usePidControlTuneStatus,
  usePidControlTuningResult,
} from '../../hooks/usePidControl.ts';

export const SettingsRoute: React.FC = () => {
  const [tuning, setTuning] = usePidControlTuneStatus();
  const tuningResult = usePidControlTuningResult();
  return (
    <Layout>
      <div className={'flex flex-col gap-4'}>
        <div
          className={
            'flex flex-col gap-4 rounded-2xl border border-gray-300 px-4 divide-x divide-gray-300 p-4'
          }
        >
          <div
            className={cx(
              'rounded-2xl w-30 flex flex-col  justify-center text-center cursor-pointer font-bold text-white text-lg',
              tuning ? 'bg-red-500' : 'bg-green-200',
            )}
            onClick={() => {
              setTuning(!tuning);
            }}
          >
            {tuning ? 'Tuning...' : 'Tune PID'}
          </div>
          <div>
            {tuningResult
              ? JSON.stringify(tuningResult)
              : 'Result will be displayed here.'}
          </div>
        </div>
      </div>
    </Layout>
  );
};
