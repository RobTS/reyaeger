import * as React from 'react';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import cx from 'classnames';
import {
  usePidControlTuneStatus,
  usePidControlTuningResult,
} from '../../hooks/usePidControl.ts';
import {
  useYaegerCommands,
  useYaegerPreferences,
} from '../../hooks/useYaeger.ts';
import { Button } from '../../components/button/button.tsx';
import { isNumber } from 'lodash-es';
import { Environment } from '../../common/env.ts';

export const SettingsPage: React.FC = () => {
  const [tuning, setTuning] = usePidControlTuneStatus();
  const tuningResult = usePidControlTuningResult();
  const preferences = useYaegerPreferences();
  const { setPreferences } = useYaegerCommands();
  const [pidKp, setPidKp] = useState(preferences?.pidKp ?? 0);
  const [pidKi, setPidKi] = useState(preferences?.pidKp ?? 0);
  const [pidKd, setPidKd] = useState(preferences?.pidKp ?? 0);
  const [cooldownFanSpeed, setCooldownFanSpeed] = useState(
    preferences?.cooldownFanSpeed ?? 65,
  );

  useEffect(() => {
    if (!preferences) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPidKp(preferences.pidKp);
    setPidKi(preferences.pidKi);
    setPidKd(preferences.pidKd);
    if (isNumber(preferences.cooldownFanSpeed))
      setCooldownFanSpeed(preferences.cooldownFanSpeed);
  }, [preferences]);

  useEffect(() => {
    if (!tuningResult) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPidKp(tuningResult.kp);
    setPidKi(tuningResult.ki);
    setPidKd(tuningResult.kd);
  }, [tuningResult]);

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
          {Environment.isDevelopment() ? (
            <Button
              className={cx(tuning ? 'bg-red-500!' : 'bg-green-200!')}
              onClick={() => {
                setTuning(!tuning);
              }}
            >
              {tuning ? 'Tuning...' : 'Tune PID'}
            </Button>
          ) : null}
          {tuningResult ? (
            <div className={'text-center'}>Click save to persist</div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};
