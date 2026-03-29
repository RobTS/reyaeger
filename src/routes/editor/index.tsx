import * as React from 'react';
import { BezierCurveEditor } from './editor.tsx';
import { Layout } from '../../components/navigation/layout.tsx';

export const EditorPage: React.FC = () => {
  return (
    <Layout>
      <div className={'flex flex-row gap-4'}>
        <BezierCurveEditor />
      </div>
    </Layout>
  );
};
