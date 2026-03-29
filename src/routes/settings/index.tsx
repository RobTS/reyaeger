import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import cx from 'classnames';
import {
  usePidControlTuneStatus,
  usePidControlTuningResult,
  usePidControlValues,
} from '../../hooks/usePidControl.ts';

export const SettingsPage: React.FC = () => {
  const [tuning, setTuning] = usePidControlTuneStatus();
  const tuningResult = usePidControlTuningResult();
  const pidValues = usePidControlValues();
  return (
    <Layout>
      <div className={'flex flex-row gap-4'}>
        <div
          className={
            'flex flex-col gap-4 rounded-2xl border border-gray-300 p-4'
          }
        >
          <div className={'text-xl text-center'}>PID Settings</div>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-row'}>
              <div>P</div>
              <div className={'flex-1 text-right'}>{pidValues.kp}</div>
            </div>
            <div className={'flex flex-row'}>
              <div>I</div>
              <div className={'flex-1 text-right'}>{pidValues.ki}</div>
            </div>
            <div className={'flex flex-row'}>
              <div>D</div>
              <div className={'flex-1 text-right'}>{pidValues.kd}</div>
            </div>
          </div>
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
          {tuningResult ? <div>{JSON.stringify(tuningResult)}</div> : null}
        </div>
      </div>
    </Layout>
  );
};
