import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { LineChart } from '../../components/chart/LineChart.tsx';
import { MetricsCard } from '../../components/cards/MetricsCard.tsx';
import { useDummyWebsocket } from '../../hooks/useDummyWebsocket.ts';
import { useRecorder } from '../../hooks/useRecorder.ts';
import { useEffect } from 'react';
import cx from 'classnames';
export const HomeRoute: React.FC = () => {
  const { lastMessage } = useDummyWebsocket({
    host: `ws://${window.location.host}/ws`,
  });
  const { records, addRecord, recording, start, stop, startDate } =
    useRecorder();

  useEffect(() => {
    if (lastMessage) addRecord(lastMessage);
  }, [addRecord, lastMessage]);

  return (
    <Layout>
      <div className={'flex flex-col gap-4'}>
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
              'rounded-2xl w-30 flex flex-col  justify-center text-center cursor-pointer',
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
            Record
          </div>
        </div>
        <LineChart records={records} startDate={startDate} />
      </div>
    </Layout>
  );
};
