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
  if (burnerVal > 90) return 0.2;
  if (burnerVal > 80) return 0.4;
  if (burnerVal > 70) return 0.8;
  if (burnerVal > 60) return 0.8;
  if (burnerVal > 50) return 0.8;
  if (burnerVal > 40) return 0.9;
  if (burnerVal > 30) return 0.9;
  if (burnerVal > 20) return 0.9;
  return 0.9;
};

const getEt = (burnerVal: number): number => {
  if (burnerVal > 90) return 220;
  if (burnerVal > 80) return 200;
  if (burnerVal > 70) return 180;
  if (burnerVal > 60) return 160;
  if (burnerVal > 50) return 140;
  if (burnerVal > 40) return 120;
  if (burnerVal > 30) return 100;
  if (burnerVal > 20) return 80;
  return 20;
};

let caloriesApplied = 800 * 20;

const beanMass = 800;

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
  et = getEt(setting.command.BurnerVal);
  const efficiency = getHeaterEfficiency(setting.command.FanVal);
  const tempDelta = et - bt;
  caloriesApplied += (time / 10000) * efficiency * tempDelta * heaterWatts;
  //console.log('Calories  applied: ' + caloriesApplied);
  //console.log('TempDelta  : ' + tempDelta);
  bt = caloriesApplied / beanMass;
  //et = Math.abs(amb);
};

setInterval(() => {
  computeCalories();
}, 100);

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
      ws.send(
        JSON.stringify({
          data: {
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
