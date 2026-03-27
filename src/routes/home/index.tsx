import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { MetricsCard } from '../../components/cards/MetricsCard.tsx';
import cx from 'classnames';
import {
  useRecorderCommands,
  useRecorderStatus,
} from '../../hooks/useRecorder.ts';
import { RoastingLineChart } from './chart.tsx';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../../hooks/useYaeger.ts';

export const HomeRoute: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const sendCommand = useYaegerSendCommand();
  const { start, stop } = useRecorderCommands();
  const recording = useRecorderStatus();

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
        </div>
        <div
          className={
            'border border-gray-300 p-2 rounded-2xl w-full aspect-auto'
          }
        >
          <RoastingLineChart />
        </div>
        <div
          className={
            'flex flex-col gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
          }
        >
          <div>Setpoint Control {lastMessage?.message.BurnerVal}</div>
          <input
            type="range"
            className="range range-xl w-full max-w-200"
            aria-label="range"
            min={0}
            max={250}
            defaultValue={lastMessage?.message.BurnerVal}
            onChange={(e) => {
              sendCommand({ BurnerVal: e.target.valueAsNumber });
            }}
          />
        </div>
        <div
          className={
            'flex flex-col gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
          }
        >
          <div>Fan Control {lastMessage?.message.FanVal}</div>
          <input
            type="range"
            className="range range-xl w-full max-w-200"
            aria-label="range"
            min={0}
            max={100}
            defaultValue={lastMessage?.message.FanVal}
            onChange={(e) => {
              sendCommand({ FanVal: e.target.valueAsNumber });
            }}
          />
        </div>
        <div
          className={
            'flex flex-col gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
          }
        >
          <div>Burner Control {lastMessage?.message.BurnerVal}</div>
          <input
            type="range"
            className="range range-xl w-full max-w-200"
            aria-label="range"
            min={0}
            max={100}
            defaultValue={lastMessage?.message.BurnerVal}
            onChange={(e) => {
              sendCommand({ BurnerVal: e.target.valueAsNumber });
            }}
          />
        </div>
      </div>
    </Layout>
  );
};
