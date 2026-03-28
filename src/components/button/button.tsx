import * as React from 'react';
import cx from 'classnames';

type Props = {
  onClick?: () => void;
  type?: 'primary' | 'default' | 'text';
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
};
export const Button: React.FC<Props> = ({
  children,
  type,
  onClick,
  className,
}) => {
  return (
    <button
      className={cx(
        'block h-10 px-4 rounded-2xl cursor-pointer',
        type === 'primary'
          ? 'bg-amber-400 shadow'
          : 'border border-gray-400 bg-white shadow',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
