import WebSocket, { WebSocketServer } from 'ws';
import { DateTime } from 'luxon';

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

let lastSetting: {
  command: { BurnerVal: number; FanVal: number };
  time: DateTime;
} = { command: { BurnerVal: 0, FanVal: 0 }, time: DateTime.now() };

const computeCalories = () => {
  const measuringTime = DateTime.now();
  const setting = lastSetting;
  lastSetting = { command: setting.command, time: measuringTime };
  const time = measuringTime.diff(setting.time).as('milliseconds');
  //console.log('Time elapsed: ' + time);
  const burnerTemp = getBurnerTemp(setting.command.BurnerVal);
  const efficiency = getHeaterEfficiency(setting.command.FanVal);
  exhaustCaloriesApplied +=
    (time / 10000) * efficiency * (burnerTemp - et) * heaterWatts;
  beanCaloriesApplied +=
    (time / 10000) * efficiency * (burnerTemp - bt) * heaterWatts;
  //console.log('Calories  applied: ' + caloriesApplied);
  //console.log('TempDelta  : ' + tempDelta);
  bt = beanCaloriesApplied / beanMass;
  et = exhaustCaloriesApplied / exhaustMass;
  //et = Math.abs(amb);
};

setInterval(() => {
  computeCalories();
}, 100);

const pidValues = {
  pidKp: 0.8,
  pidKi: 0.16,
  pidKd: 1.2,
};
wss.on('connection', (ws: WebSocket) => {
  ws.on('error', console.error);

  ws.on('message', function message(buffer: Buffer) {
    try {
      const payload = JSON.parse(buffer.toString());
      if (payload.BurnerVal !== undefined || payload.FanVal !== undefined) {
        computeCalories();

        lastSetting = {
          time: DateTime.now(),
          command: { ...(lastSetting ? lastSetting.command : {}), ...payload },
        };
      }
      if (['setPid', 'getPid'].includes(payload.command)) {
        if (payload.command === 'setPid') {
          pidValues.pidKp = payload.pidKp;
          pidValues.pidKi = payload.pidKi;
          pidValues.pidKd = payload.pidKd;
        }
        ws.send(
          JSON.stringify({
            data: {
              type: 'pid',
              ...pidValues,
            },
          }),
        );
        return;
      }
      ws.send(
        JSON.stringify({
          data: {
            type: 'status',
            ET: et,
            BT: bt,
            Amb: amb,
            FanVal: lastSetting?.command.FanVal || 0,
            BurnerVal: lastSetting?.command.BurnerVal || 0,
            id: DateTime.now().toSeconds(),
          },
        }),
      );
    } catch (e) {
      console.log('parsing error', e);
    }
  });
});
