import * as React from 'react';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../../hooks/useYaeger.ts';
import {
  usePidControlSetpoint,
  usePidControlStatus,
} from '../../hooks/usePidControl.ts';

export const RoastingControls: React.FC = () => {
  const lastMessage = useYaegerLastMessage();
  const sendCommand = useYaegerSendCommand();
  const [setpoint, setSetpoint] = usePidControlSetpoint();
  const [pidEnabled, setPidEnabled] = usePidControlStatus();
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
        <div className={'flex flex-row gap-2'}>
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
