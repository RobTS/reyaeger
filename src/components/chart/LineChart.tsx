import * as React from 'react';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin, {
  type AnnotationOptions,
} from 'chartjs-plugin-annotation';
import type {
  RoastEvent,
  YaegerMessageWrapper,
} from '../../types/connection.ts';

Chart.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

const calculateRoR = (temps: number[], times: number[]) =>
  temps.map((temp, i) => {
    if (i === 0) return null; // No RoR for the first data point
    const deltaTemp = temp - temps[i - 1];
    const deltaTime = times[i] - times[i - 1];
    return deltaTime > 0 ? deltaTemp / deltaTime : 0;
  });

// Helper to calculate rolling average
const applyRollingAverage = (values: (number | null)[], size: number) => {
  return values.map((val, i, arr) => {
    if (val === null || i < size - 1) return val; // Skip if insufficient data
    const frame = arr.slice(i - size + 1, i + 1) as number[];
    return frame.reduce((sum, v) => sum + v * 60, 0) / size;
  });
};

const windowSize = 30 * 5;

export const LineChart: React.FC<{
  records: YaegerMessageWrapper[];
  events: RoastEvent[];
}> = ({ records, events }) => {
  const startDate = records[0]?.time;
  // Calculate RoR and apply rolling averages
  const { beanTemps, envTemps, timestamps, setpoints, btRor, etRor } =
    useMemo(() => {
      const beanTemps: number[] = [];
      const envTemps: number[] = [];
      const setpoints: number[] = [];
      const timestamps: number[] = [];
      records.forEach((r) => {
        beanTemps.push(r.message.BT);
        envTemps.push(r.message.ET);
        timestamps.push(startDate ? r.time.diff(startDate).as('seconds') : 0);
        setpoints.push(r.extras?.setpoint || 0);
      });
      const btRor = applyRollingAverage(
        calculateRoR(beanTemps, timestamps),
        windowSize,
      );
      const etRor = applyRollingAverage(
        calculateRoR(envTemps, timestamps),
        windowSize,
      );
      return {
        beanTemps,
        envTemps,
        timestamps,
        setpoints,
        btRor,
        etRor,
      };
    }, [records, startDate]);

  return (
    <Line
      options={{
        interaction: {
          intersect: false,
          mode: 'index',
          axis: 'xy',
        },
        plugins: {
          tooltip: {
            callbacks: {
              // eslint-disable-next-line
              title:  (item: any)=> {
                const x = item[0].parsed.x;
                if (x < 60) {
                  return `${x} seconds`;
                }
                return `${Math.floor(x / 60)} minutes, ${(x % 60).toFixed(2)} seconds`;
              },
            },
          },
          annotation: {
            annotations: [
              ...events.map((e): AnnotationOptions => {
                return {
                  type: 'line',
                  xMin: startDate ? e.time.diff(startDate).as('seconds') : 0,
                  xMax: startDate ? e.time.diff(startDate).as('seconds') : 0,
                  borderColor: 'rgb(255, 99, 132)',
                  borderWidth: 2,
                };
              }),
              ...events.map((e): AnnotationOptions => {
                return {
                  type: 'label',
                  xValue: startDate ? e.time.diff(startDate).as('seconds') : 0,
                  yValue: 2,
                  content: [e.label],
                  font: {
                    size: 14,
                  },
                  color: 'rgb(255, 99, 132)',
                  xAdjust: 0,
                  yAdjust: -24,
                  textAlign: 'start',
                  position: '0%',
                };
              }),
            ],
          },
        },
        scales: {
          x: {
            grace: 5,
            type: 'linear',
            bounds: 'ticks',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time',
            },
            min: 0,
            ticks: {
              stepSize: 60,
              // eslint-disable-next-line
              callback:  (value: any)=> {
                if (value <= 60) {
                  return `${value}s`;
                } else {
                  const minutes = Math.floor(value / 60);
                  return `${minutes}m`;
                }
              },
            },
          },
          //x: { type: 'time', time: { unit: 'minute' } },
          y1: {
            min: 0,
            max: 300,
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Temperature (°C)',
            },
          },
          y2: {
            min: 0,
            max: 100,
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Fan/Heater power (%)',
            },
          },
          y3: {
            min: 0,
            max: 60,
            //type: "logarithmic",
          },
        },
        responsive: true,
        animation: false,
      }}
      data={{
        labels: timestamps,
        datasets: [
          {
            label: 'Bean Temp',
            borderColor: 'blue',
            pointStyle: false,
            data: beanTemps,
            yAxisID: 'y1',
            tension: 0.4,
          },
          {
            label: 'Exhaust Temp',
            borderColor: 'red',
            pointStyle: false,
            data: envTemps,
            yAxisID: 'y1',
            tension: 0.4,
          },
          {
            label: 'Fan Power',
            borderColor: '#055088',
            pointStyle: false,
            data: records.map((r) => r.message.FanVal),
            yAxisID: 'y2',
            tension: 0.1,
          },
          {
            label: 'Heater Power',
            pointStyle: false,
            borderColor: 'orange',
            data: records.map((r) => r.message.BurnerVal),
            yAxisID: 'y2',
            tension: 0.1,
          },
          {
            label: 'BT Rate of Rise (°C/min)',
            borderColor: 'green',
            pointStyle: false,
            data: btRor,
            yAxisID: 'y3',
            tension: 0.2,
          },
          {
            label: 'ET Rate of Rise (°C/min)',
            borderColor: 'purple',
            pointStyle: false,
            data: etRor,
            yAxisID: 'y3',
            tension: 0.2,
          },
          {
            label: 'Setpoint (°C)',
            borderColor: '#03fc7b',
            pointStyle: false,
            data: setpoints,
            yAxisID: 'y1',
            tension: 0.1,
          },
        ],
      }}
    />
  );
};
