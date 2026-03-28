import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { MetricsCard } from '../../components/cards/MetricsCard.tsx';
import { useRecorderStartDate } from '../../hooks/useRecorder.ts';
import { RoastingLineChart } from './chart.tsx';
import { useYaegerLastMessage } from '../../hooks/useYaeger.ts';
import { RoastingControls } from './controls.tsx';
import { ProfileControls } from './profile.tsx';
import { DateTime } from 'luxon';

const EtCard = () => {
  const lastMessage = useYaegerLastMessage();
  return (
    <MetricsCard
      name={'ET'}
      unit={'C'}
      value={lastMessage?.message.ET.toFixed(1) || '-'}
    />
  );
};

const BtCard = () => {
  const lastMessage = useYaegerLastMessage();
  return (
    <MetricsCard
      name={'BT'}
      unit={'C'}
      value={lastMessage?.message.BT.toFixed(1) || '-'}
    />
  );
};

export const HomeRoute: React.FC = () => {
  const startDate = useRecorderStartDate();
  const duration = startDate
    ? DateTime.now().diff(startDate).toFormat('mm:ss')
    : undefined;

  return (
    <Layout>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-4'}>
          <div
            className={
              'border border-gray-300 p-2 rounded-2xl w-full aspect-auto'
            }
          >
            <RoastingLineChart />
          </div>
          <div className={'flex flex-col flex-wrap gap-4 justify-between'}>
            <EtCard />
            <BtCard />
            <MetricsCard
              name={''}
              unit={''}
              value={duration ? duration : '00:00'}
            />
          </div>
        </div>
        <div className={'flex flex-row gap-4 w-full items-stretch'}>
          <ProfileControls />
          <RoastingControls />
        </div>
      </div>
    </Layout>
  );
};
