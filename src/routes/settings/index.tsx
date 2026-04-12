import * as React from 'react';
import { Layout } from '../../components/navigation/layout.tsx';
import { RoastProperties } from './roastProperties.tsx';
import { WifiProperties } from './wifiProperties.tsx';

export const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className={'flex flex-row gap-4 max-md:flex-wrap'}>
        <RoastProperties />
        <WifiProperties />
      </div>
    </Layout>
  );
};
