import * as React from 'react';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../../hooks/useYaeger.ts';
import { usePidControlSetpoint } from '../../hooks/usePidControl.ts';

export const RoastingControls: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const sendCommand = useYaegerSendCommand();
  const [setpoint, setSetpoint] = usePidControlSetpoint();
  return (
    <>
      <div
        className={
          'flex flex-col gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
        }
      >
        <div>Setpoint Control {setpoint}</div>
        <input
          type="range"
          className="range range-xl w-full max-w-200"
          aria-label="range"
          min={0}
          max={250}
          defaultValue={setpoint}
          onChange={(e) => {
            setSetpoint(e.target.valueAsNumber);
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
    </>
  );
};
