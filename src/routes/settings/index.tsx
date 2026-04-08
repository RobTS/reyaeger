import * as React from 'react';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import cx from 'classnames';
import {
  useYaegerCommands,
  useYaegerLastMessage,
  useYaegerPreferences,
} from '../../hooks/useYaeger.ts';
import { Button } from '../../components/button/button.tsx';
import { isNumber } from 'lodash-es';

export const SettingsPage: React.FC = () => {
  const preferences = useYaegerPreferences();
  const { setPreferences, startAutotune } = useYaegerCommands();
  const lastMessage = useYaegerLastMessage()?.message;
  const [pidKp, setPidKp] = useState(preferences?.pidKp ?? 0);
  const [pidKi, setPidKi] = useState(preferences?.pidKp ?? 0);
  const [pidKd, setPidKd] = useState(preferences?.pidKp ?? 0);
  const [cooldownFanSpeed, setCooldownFanSpeed] = useState(
    preferences?.cooldownFanSpeed ?? 65,
  );

  useEffect(() => {
    if (!preferences) return;
    if (isNumber(preferences.cooldownFanSpeed))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldownFanSpeed(preferences.cooldownFanSpeed);
  }, [preferences]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPidKp(lastMessage?.pidKp || 0);
    setPidKi(lastMessage?.pidKi || 0);
    setPidKd(lastMessage?.pidKd || 0);
  }, [lastMessage?.pidKp, lastMessage?.pidKi, lastMessage?.pidKd]);

  const changed =
    preferences?.pidKp !== pidKp ||
    preferences?.pidKd !== pidKd ||
    preferences?.pidKi !== pidKi ||
    preferences?.cooldownFanSpeed !== cooldownFanSpeed;

  return (
    <Layout>
      <div className={'flex flex-row gap-4'}>
        <div
          className={
            'flex flex-col gap-4 rounded-2xl border border-gray-300 p-4 max-md:w-full lg:w-80'
          }
        >
          <div className={'text-xl font-bold text-center'}>Preferences</div>

          <div className={'text-xl text-center'}>General</div>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-row gap-4'}>
              <div className={'flex flex-2'}>Cooldown Fan Speed</div>
              <div className={'flex-1'}>
                <input
                  type={'number'}
                  className={
                    'w-full border border-gray-400 rounded-md text-end'
                  }
                  value={cooldownFanSpeed}
                  onChange={(e) => {
                    setCooldownFanSpeed(e.target.valueAsNumber);
                  }}
                  max={100}
                  min={0}
                />
              </div>
            </div>
          </div>
          <div className={'text-xl text-center'}>PID Settings</div>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-row gap-4'}>
              <div className={'flex flex-1'}>P</div>
              <div className={'flex-2'}>
                <input
                  type={'number'}
                  className={
                    'w-full border border-gray-400 rounded-md text-end'
                  }
                  value={pidKp}
                  onChange={(e) => {
                    setPidKp(e.target.valueAsNumber);
                  }}
                  step={0.1}
                  min={0}
                />
              </div>
            </div>
            <div className={'flex flex-row gap-4'}>
              <div className={'flex flex-1'}>I</div>
              <div className={'flex-2'}>
                <input
                  type={'number'}
                  className={
                    'w-full border border-gray-400 rounded-md text-end'
                  }
                  value={pidKi}
                  onChange={(e) => {
                    setPidKi(e.target.valueAsNumber);
                  }}
                  step={0.001}
                  min={0}
                />
              </div>
            </div>
            <div className={'flex flex-row gap-4'}>
              <div className={'flex flex-1'}>D</div>
              <div className={'flex-2'}>
                <input
                  type={'number'}
                  className={
                    'w-full border border-gray-400 rounded-md text-end'
                  }
                  value={pidKd}
                  onChange={(e) => {
                    setPidKd(e.target.valueAsNumber);
                  }}
                  step={0.1}
                  min={0}
                />
              </div>
            </div>
          </div>
          <Button
            type={'primary'}
            disabled={!changed}
            onClick={() => {
              setPreferences({
                pidKp,
                pidKi,
                pidKd,
                cooldownFanSpeed,
              });
            }}
          >
            Save
          </Button>
          {}

          <Button
            className={cx('bg-green-200!')}
            onClick={() => {
              startAutotune();
            }}
          >
            {'Tune PID'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
