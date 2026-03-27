import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { MetricsCard } from '../../components/cards/MetricsCard.tsx';
import cx from 'classnames';
import {
  useRecorderCommands,
  useRecorderStartDate,
  useRecorderStatus,
} from '../../hooks/useRecorder.ts';
import { RoastingLineChart } from './chart.tsx';
import { useYaegerLastMessage } from '../../hooks/useYaeger.ts';
import { RoastingControls } from './controls.tsx';
import { ProfileControls } from './profile.tsx';
import { DateTime } from 'luxon';

export const HomeRoute: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const { start, stop } = useRecorderCommands();
  const startDate = useRecorderStartDate();
  const recording = useRecorderStatus();

  const duration = startDate
    ? DateTime.now().diff(startDate).toFormat('mm:ss')
    : undefined;
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
            {duration ? duration : ''}
            <br />
            {recording ? 'Pause' : 'Record'}
          </div>
        </div>
        <div
          className={
            'border border-gray-300 p-2 rounded-2xl w-full aspect-auto'
          }
        >
          <RoastingLineChart />
        </div>
        <div className={'flex flex-row gap-4 w-full'}>
          <ProfileControls />
          <RoastingControls />
        </div>
      </div>
    </Layout>
  );
};
