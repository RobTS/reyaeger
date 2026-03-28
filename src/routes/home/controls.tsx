import * as React from 'react';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../../hooks/useYaeger.ts';
import {
  usePidControlReferenceValue,
  usePidControlSetpoint,
  usePidControlStatus,
} from '../../hooks/usePidControl.ts';
import { Button } from '../../components/button/button.tsx';
import { useHotkeys } from 'react-hotkeys-hook';

export const RoastingControls: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const sendCommand = useYaegerSendCommand();
  const [setpoint, setSetpoint] = usePidControlSetpoint();
  const [pidEnabled, setPidEnabled] = usePidControlStatus();
  const [pidReference, setPidReference] = usePidControlReferenceValue();

  useHotkeys('d', () => {
    if (pidEnabled) {
      setSetpoint(Math.min(setpoint + 1, 250));
    } else {
      if (!lastMessage) return;
      sendCommand({
        BurnerVal: Math.min(lastMessage.message.BurnerVal + 1, 100),
      });
    }
  });
  useHotkeys('a', () => {
    if (pidEnabled) {
      setSetpoint(Math.max(setpoint - 1, 250));
    } else {
      if (!lastMessage) return;
      sendCommand({
        BurnerVal: Math.max(lastMessage.message.BurnerVal - 1, 0),
      });
    }
  });
  useHotkeys('w', () => {
    if (!lastMessage) return;
    sendCommand({
      FanVal: Math.min(lastMessage.message.FanVal + 1, 100),
    });
  });
  useHotkeys('s', () => {
    if (!lastMessage) return;
    sendCommand({
      FanVal: Math.max(lastMessage.message.FanVal - 1, 0),
    });
  });

  return (
    <div className={'flex flex-col gap-4 flex-1'}>
      <div
        className={
          'flex flex-col gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
        }
      >
        <div>Fan Control - {lastMessage?.message.FanVal.toFixed(1)} %</div>
        <input
          type="range"
          className="range range-xl w-full max-w-200"
          aria-label="range"
          min={0}
          max={100}
          value={lastMessage?.message.FanVal}
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
        {pidEnabled ? (
          <div>
            Heater Control - {setpoint.toFixed(1)} °C (
            {lastMessage?.message.BurnerVal.toFixed(1)} %)
          </div>
        ) : (
          <div>
            Heater Control - {lastMessage?.message.BurnerVal.toFixed(1)} %
          </div>
        )}
        <div className={'flex flex-row gap-4 items-center'}>
          <div className={'flex flex-row gap-2 '}>
            <label className="flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                checked={pidEnabled}
                onChange={() => setPidEnabled(!pidEnabled)}
                className="peer h-5 w-5 cursor-pointer transition-all rounded shadow hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                id="check1"
              />
            </label>
            Use PID
          </div>
          <div className={'flex flex-row'}>
            <Button
              onClick={() => setPidReference('BT')}
              type={pidReference === 'BT' ? 'primary' : 'default'}
              className={'rounded-r-none'}
            >
              BT
            </Button>
            <Button
              onClick={() => setPidReference('ET')}
              type={pidReference === 'ET' ? 'primary' : 'default'}
              className={'rounded-none'}
            >
              ET
            </Button>
            <Button
              onClick={() => setPidReference('MAX')}
              type={pidReference === 'MAX' ? 'primary' : 'default'}
              className={'rounded-l-none'}
            >
              MAX
            </Button>
          </div>
        </div>

        {pidEnabled ? (
          <input
            type="range"
            className="range range-xl w-full max-w-200"
            aria-label="range"
            min={0}
            max={250}
            value={setpoint}
            onChange={(e) => {
              setSetpoint(e.target.valueAsNumber);
            }}
          />
        ) : (
          <input
            type="range"
            className="range range-xl w-full max-w-200"
            aria-label="range"
            min={0}
            max={100}
            value={lastMessage?.message.BurnerVal}
            onChange={(e) => {
              sendCommand({ BurnerVal: e.target.valueAsNumber });
            }}
          />
        )}
      </div>
    </div>
  );
};
