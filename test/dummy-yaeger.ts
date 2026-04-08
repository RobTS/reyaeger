import WebSocket, { WebSocketServer } from 'ws';
import { DateTime } from 'luxon';
import type {
  HeaterMode,
  TemperatureTarget,
  YaegerStatusMessage,
} from '../src/types/connection.ts';
import { isNumber } from 'lodash-es';
import { PidAutoTune2 } from './pidControl.ts';

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
});

const heaterWatts = 1100;

const getHeaterEfficiency = (burnerVal: number): number => {
  return 1 - (burnerVal / 100) * 0.5;
};

const getBurnerTemp = (burnerVal: number): number => {
  return 20 + (burnerVal / 100) * 220;
};

const beanMass = 1600;
let beanCaloriesApplied = beanMass * 20;

const exhaustMass = 200;
let exhaustCaloriesApplied = exhaustMass * 20;

let bt = 20;
let et = 20;
const amb = 20;

type IncomingMessage = {
  command: 'setPreferences' | 'getPreferences' | 'status';
  BurnerVal?: number;
  FanVal?: number;
  Setpoint?: number;
  Mode?: HeaterMode;
  Target?: TemperatureTarget;
  pidKp?: number;
  pidKi?: number;
  pidKd?: number;
};

type ReferenceMessage = { time: DateTime; message: YaegerStatusMessage };

let previousMessage: ReferenceMessage | undefined;

const computeCalories = (
  previousMessage: ReferenceMessage | undefined,
  currentMessage: ReferenceMessage,
) => {
  if (!previousMessage) return;
  const measuringTime = currentMessage.time;
  const time = Math.abs(
    measuringTime.diff(previousMessage.time).as('milliseconds'),
  );
  const burnerTemp = getBurnerTemp(previousMessage.message.BurnerVal);
  const efficiency = getHeaterEfficiency(previousMessage.message.FanVal);
  exhaustCaloriesApplied +=
    (time / 10000) * efficiency * (burnerTemp - et) * heaterWatts;
  beanCaloriesApplied +=
    (time / 10000) * efficiency * (burnerTemp - bt) * heaterWatts;
  bt = beanCaloriesApplied / beanMass;
  et = exhaustCaloriesApplied / exhaustMass;
};

let target: TemperatureTarget = 'ET';
let fanVal: number = 0;
let burnerVal: number = 0;

const autotuner = new PidAutoTune2(0, 90);
autotuner.setManualGains(1, 0.5, 3);
autotuner.setOperationalMode('Tune');

wss.on('connection', (ws: WebSocket) => {
  ws.on('error', console.error);

  ws.on('message', function message(buffer: Buffer) {
    try {
      const payload = JSON.parse(buffer.toString()) as IncomingMessage;

      if (payload.Setpoint !== undefined) {
        autotuner.setSetpoint(payload.Setpoint);
      }
      if (payload.FanVal !== undefined) {
        fanVal = payload.FanVal;
      }
      if (payload.BurnerVal !== undefined) {
        burnerVal = payload.BurnerVal;
      }
      if (autotuner.getOperationalMode() !== 'Tune') {
        if (payload.Mode === 'PID') {
          autotuner.setOperationalMode('Auto');
        }
        if (payload.Mode === 'Manual') {
          autotuner.setOperationalMode('Manual');
        }
      }

      if (payload.Target !== undefined) {
        target = payload.Target;
      }

      if (['setPreferences', 'getPreferences'].includes(payload.command)) {
        if (payload.command === 'setPreferences') {
          if (
            isNumber(payload.pidKp) &&
            isNumber(payload.pidKi) &&
            isNumber(payload.pidKd)
          )
            autotuner.setManualGains(
              payload.pidKp,
              payload.pidKi,
              payload.pidKd,
            );
        }
        ws.send(
          JSON.stringify({
            data: {
              type: 'preferences',
              pidKd: autotuner.getKd(),
              pidKi: autotuner.getKi(),
              pidKp: autotuner.getKp(),
            },
          }),
        );
        return;
      }

      const autoTunerInput =
        target === 'ET' ? et : target === 'BT' ? bt : Math.max(et, bt);
      autotuner.update(autoTunerInput);
      burnerVal = autotuner.getOutput();
      const result: YaegerStatusMessage = {
        id: DateTime.now().toSeconds(),
        type: 'status',
        ET: et,
        BT: bt,
        Amb: amb,
        FanVal: fanVal,
        BurnerVal: burnerVal,
        pidKd: autotuner.getKd(),
        pidKi: autotuner.getKi(),
        pidKp: autotuner.getKp(),
        Setpoint: autotuner.getSetpoint(),
        Mode: autotuner.getOperationalMode() === 'Auto' ? 'PID' : 'Manual',
        Target: target,
      };
      const newMessage: ReferenceMessage = {
        message: result,
        time: DateTime.now(),
      };
      computeCalories(previousMessage, newMessage);
      previousMessage = newMessage;
      ws.send(
        JSON.stringify({
          data: result,
        }),
      );
    } catch (e) {
      console.log('parsing error', e);
    }
  });
});
