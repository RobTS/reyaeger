import * as React from 'react';
import Dropzone from 'react-dropzone';
import {
  useProfileExecutionEnabled,
  useProfileExecutionProfile,
} from '../../hooks/useProfileExecution.ts';
import { useRecorderCommands } from '../../hooks/useRecorder.ts';

export const ProfileControls: React.FC = () => {
  const [profile, setProfile] = useProfileExecutionProfile();
  const [enabled, setEnabled] = useProfileExecutionEnabled();
  const { start } = useRecorderCommands();
  return (
    <div
      className={
        'flex flex-col flex-1 gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
      }
    >
      <h2>Profile</h2>

      {!profile ? (
        <Dropzone
          onDrop={(acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) {
              return;
            }
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                const jsonData = JSON.parse(e.target?.result as string);
                setProfile(jsonData);
              } catch (error) {
                console.log('upload failed:', error);
              }
            };
            reader.readAsText(file);
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div
                {...getRootProps()}
                className={
                  'border-2 border-dashed border-gray-300 h-20 w-full rounded-2xl p-4'
                }
              >
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      ) : (
        <div className={'flex flex-col gap-2'}>
          <div className={'text-center'}>
            Duration:{' '}
            {profile.steps.reduce((acc, step) => {
              acc += step.duration;
              return acc;
            }, 0)}
          </div>
          <div className={'flex flex-row gap-2'}>
            <button
              className={
                'block h-10 bg-blue-200 px-4 rounded-2xl cursor-pointer'
              }
              onClick={() => {
                setEnabled(!enabled);
                if (!enabled) {
                  start();
                }
              }}
            >
              {enabled ? 'Stop' : 'Start'}
            </button>
            <button
              className={
                'block h-10 bg-gray-200 px-4 rounded-2xl cursor-pointer'
              }
              onClick={() => setProfile(undefined)}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
