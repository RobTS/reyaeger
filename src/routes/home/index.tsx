import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { MetricsCard } from '../../components/cards/MetricsCard.tsx';
import cx from 'classnames';
import {
  useRecorderCommands,
  useRecorderStatus,
} from '../../hooks/useRecorder.ts';
import { RoastingLineChart } from './chart.tsx';
import { useYaegerLastMessage } from '../../hooks/useYaeger.ts';
import { RoastingControls } from './controls.tsx';
import { usePidControlTuneStatus } from '../../hooks/usePidControl.ts';

export const HomeRoute: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const { start, stop } = useRecorderCommands();
  const recording = useRecorderStatus();
  const [tuning, setTuning] = usePidControlTuneStatus();

  return (
    <Layout>
      <div className={'flex flex-col gap-4 items-center'}>
        <div className={'flex flex-row flex-wrap gap-4 justify-center'}>
          <MetricsCard
            name={'ET'}
            unit={'C'}
            value={lastMessage?.message.ET || 0}
          />
          <MetricsCard
            name={'BT'}
            unit={'C'}
            value={lastMessage?.message.BT || 0}
          />
          <div
            className={cx(
              'rounded-2xl w-30 flex flex-col  justify-center text-center cursor-pointer font-bold text-white text-lg',
              recording ? 'bg-red-500' : 'bg-green-500',
            )}
            onClick={() => {
              if (!recording) {
                start();
              } else {
                stop();
              }
            }}
          >
            {recording ? 'Pause' : 'Record'}
          </div>
          <div
            className={cx(
              'rounded-2xl w-30 flex flex-col  justify-center text-center cursor-pointer font-bold text-white text-lg',
              recording ? 'bg-red-500' : 'bg-green-500',
            )}
            onClick={() => {
              setTuning(!tuning);
            }}
          >
            {tuning ? 'Tuning...' : 'Tune PID'}
          </div>
        </div>
        <div
          className={
            'border border-gray-300 p-2 rounded-2xl w-full aspect-auto'
          }
        >
          <RoastingLineChart />
        </div>
        <RoastingControls />
      </div>
    </Layout>
  );
};
