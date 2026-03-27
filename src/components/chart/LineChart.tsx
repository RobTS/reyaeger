import * as React from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { DateTime } from 'luxon';
import type { YaegerMessageWrapper } from '../../types/connection.ts';

Chart.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

export const LineChart: React.FC<{
  startDate: DateTime | undefined;
  records: YaegerMessageWrapper[];
}> = ({ records, startDate }) => {
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
            annotations: {
              line1: {
                type: 'line',
                xMin: 2,
                xMax: 2,
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
              },
              label1: {
                type: 'label',
                xValue: 2,
                yValue: 0,
                content: ['Event'],
                font: {
                  size: 14,
                },
                color: 'rgb(255, 99, 132)',
                xAdjust: 0,
                yAdjust: -24,
                textAlign: 'start',
                position: '0%',
              },
            },
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
        labels: startDate
          ? records.map((r) => r.time.diff(startDate).as('seconds'))
          : [],
        datasets: [
          {
            label: 'Bean Temp',
            borderColor: 'blue',
            pointStyle: false,
            data: records.map((r) => r.message.BT),
            yAxisID: 'y1',
            tension: 0.4,
          },
          {
            label: 'Exhaust Temp',
            borderColor: 'red',
            pointStyle: false,
            data: records.map((r) => r.message.ET),
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
        ],
      }}
    />
  );
};
