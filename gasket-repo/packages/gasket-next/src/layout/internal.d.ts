import type { ReactElement } from 'react';
import type { Gasket } from '@gasket/core';
import type { GasketRequest } from '@gasket/request';
import { Presentation } from '../server/presentation';

export function prepareLayout(
  element: ReactElement
): ReactElement;

export function requestLayout(
  gasket: Gasket,
  Presentation: typeof Presentation,
  req: GasketRequest,
  props?: Record<string, any>
)
