import { useYaegerCommands } from '../../hooks/useYaeger.ts';
import React, { useState } from 'react';
import { Button } from '../../components/button/button.tsx';

export const WifiProperties: React.FC = () => {
  const { setPreferences } = useYaegerCommands();
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [success, setSuccess] = useState(false);

  const changed = wifiSsid && wifiPass;

  return (
    <div
      className={
        'flex flex-col gap-4 rounded-2xl border border-gray-300 p-4 max-md:w-full lg:w-80'
      }
    >
      <div className={'text-xl font-bold text-center'}>Wifi Settings</div>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-4'}>
          <div className={'flex flex-1'}>SSID</div>
          <div className={'flex-2'}>
            <input
              type={'text'}
              className={'w-full border border-gray-400 rounded-md'}
              value={wifiSsid}
              onChange={(e) => {
                setWifiSsid(e.target.value);
              }}
              step={0.1}
              min={0}
            />
          </div>
        </div>
      </div>{' '}
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-4'}>
          <div className={'flex flex-1'}>Password</div>
          <div className={'flex-2'}>
            <input
              type={'text'}
              className={'w-full border border-gray-400 rounded-md'}
              value={wifiPass}
              onChange={(e) => {
                setWifiPass(e.target.value);
              }}
              step={0.1}
              min={0}
            />
          </div>
        </div>
      </div>
      <Button
        type={'primary'}
        disabled={!changed}
        onClick={() => {
          setPreferences({
            wifiSsid,
            wifiPass,
          });
          setSuccess(true);
          setWifiSsid('');
          setWifiPass('');
        }}
      >
        Save
      </Button>
      {success ? (
        <div className={'p-4 border border-green-400 bg-green-100 rounded-2xl'}>
          Wifi Credentials saved successfully, reboot the device to apply.
        </div>
      ) : null}
    </div>
  );
};
