import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import cx from 'classnames';
import {
  usePidControlTuneStatus,
  usePidControlTuningResult,
} from '../../hooks/usePidControl.ts';
import {
  useYaegerCommands,
  useYaegerPidValues,
} from '../../hooks/useYaeger.ts';
import { useEffect, useState } from 'react';
import { Button } from '../../components/button/button.tsx';
import { Environment } from '../../common/env.ts';

export const SettingsPage: React.FC = () => {
  const [tuning, setTuning] = usePidControlTuneStatus();
  const tuningResult = usePidControlTuningResult();
  const pidValues = useYaegerPidValues();
  const { updatePid } = useYaegerCommands();
  const [pidKp, setPidKp] = useState(pidValues?.pidKp || 0);
  const [pidKi, setPidKi] = useState(pidValues?.pidKp || 0);
  const [pidKd, setPidKd] = useState(pidValues?.pidKp || 0);

  useEffect(() => {
    if (!pidValues) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPidKp(pidValues.pidKp);
    setPidKi(pidValues.pidKi);
    setPidKd(pidValues.pidKd);
  }, [pidValues]);

  useEffect(() => {
    if (!tuningResult) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPidKp(tuningResult.kp);
    setPidKi(tuningResult.ki);
    setPidKd(tuningResult.kd);
  }, [tuningResult]);

  return (
    <Layout>
      <div className={'flex flex-row gap-4'}>
        <div
          className={
            'flex flex-col gap-4 rounded-2xl border border-gray-300 p-4 max-md:w-full lg:w-80'
          }
        >
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
                />
              </div>
            </div>
          </div>
          <Button
            type={'primary'}
            onClick={() => {
              updatePid({
                kp: pidKp,
                ki: pidKi,
                kd: pidKd,
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
