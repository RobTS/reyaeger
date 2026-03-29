import * as React from 'react';
import { BezierCurveEditor } from './editor.tsx';
import { Layout } from '../../components/navigation/layout.tsx';

export const EditorPage: React.FC = () => {
  return (
    <Layout>
      <div className={'flex flex-row gap-4'}>
        <BezierCurveEditor
          onCurveChange={() => {}}
          targetControl={{ x: 0.5, y: 0.5 }}
          targetTemperature={210}
          targetTimeMinutes={7}
          actualTemperature={25}
          currentTime={50}
          startTemperature={20}
        />
      </div>
    </Layout>
  );
};
