import * as React from 'react';
import { NavLink } from 'react-router';

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
        <div className={'text-lg'}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'text-blue-300' : '')}
          >
            Home
          </NavLink>
        </div>
        <div className={'text-lg'}>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'text-blue-300' : '')}
          >
            Settings
          </NavLink>
        </div>
      </div>
      <div className={'h-full p-4 flex flex-col items-center'}>
        <div className={'w-full max-w-300'}>{children}</div>
      </div>
    </div>
  );
};
