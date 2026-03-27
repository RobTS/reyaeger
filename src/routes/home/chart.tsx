import {
  useRecorderRecords,
  useRecorderStartDate,
} from '../../hooks/useRecorder.ts';
import * as React from 'react';
import { LineChart } from '../../components/chart/LineChart.tsx';

export const RoastingLineChart: React.FC = () => {
  const records = useRecorderRecords();
  const startDate = useRecorderStartDate();
  return <LineChart records={records} startDate={startDate} />;
};
