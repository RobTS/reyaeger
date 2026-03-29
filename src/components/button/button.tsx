import * as React from 'react';
import cx from 'classnames';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  iconLeft?: IconDefinition;
  iconRight?: IconDefinition;
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
  iconLeft,
  iconRight,
}) => {
  return (
    <button
      className={cx(
        'block h-10 px-4 rounded-2xl cursor-pointer gap-2',
        type === 'primary'
          ? 'bg-amber-400 shadow'
          : 'border border-gray-400 bg-white shadow',
        className,
      )}
      onClick={onClick}
    >
      {iconLeft ? (
        <FontAwesomeIcon
          icon={iconLeft}
          className={children ? 'mr-2' : undefined}
        />
      ) : null}
      {children}
      {iconRight ? (
        <FontAwesomeIcon
          icon={iconRight}
          className={children ? 'ml-2' : undefined}
        />
      ) : null}
    </button>
  );
};
