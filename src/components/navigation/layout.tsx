import * as React from 'react';
import { NavLink } from 'react-router';
import { ConnectionStatus } from '../ConnectionStatus.tsx';

export const Layout: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  return (
    <div className={'flex flex-col'}>
      <div
        className={
          'h-16  px-4 bg-gray-600 items-center text-white flex flex-row gap-4'
        }
      >
        <div className={'font-bold text-lg mr-4'}>ReYaeger Frontend</div>
        <div className={'flex flex-row gap-4 text-lg flex-1'}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'text-blue-300' : '')}
          >
            Home
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'text-blue-300' : '')}
          >
            Settings
          </NavLink>
        </div>
        <ConnectionStatus />
      </div>
      <div className={'h-full p-4 flex flex-col items-center'}>
        <div className={'w-full max-w-300'}>{children}</div>
      </div>
    </div>
  );
};
