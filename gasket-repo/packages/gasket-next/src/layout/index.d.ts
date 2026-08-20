import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Presentation, getProps } from '../server';
import type { Gasket, MaybeAsync } from '@gasket/core';

export { Presentation };

/**
 * Create the layout function for a presentation
 * @param gasket
 * @param CustomPresentation
 * @returns A function that takes props with children and returns a ReactElement
 * (synchronously or asynchronously)
 */
export function makeLayout(
  gasket: Gasket,
  /** Optional constructor for creating a Presentation instance */
  CustomPresentation?: {
    new (props: PropsWithChildren<any>): Presentation;
  } & { getProps?: getProps }
): (props: PropsWithChildren<any>) => MaybeAsync<ReactElement>;

/**
 * Create the layout function for a presentation.
 * This uses Next header and cookies functions for incoming requests which
 * opts out of static optimizations.
 * @param gasket
 * @param CustomPresentation
 * @returns A function that takes props with children and returns a ReactElement
 * (synchronously or asynchronously)
 */
export function makeDynamicLayout(
  gasket: Gasket,
  /** Optional constructor for creating a Presentation instance */
  CustomPresentation?: {
    new (props: PropsWithChildren<any>): Presentation;
  } & { getProps?: getProps }
): (props: PropsWithChildren<any>) => MaybeAsync<ReactElement>;

/**
 * Convert a script element or an array of script elements to a ReactNode or
 * null
 * @param element
 * @returns A ReactNode or null
 */
export function convertScript(
  /** A single ReactElement or an array of ReactElements */
  element: ReactElement<PropsWithChildren<any>> | ReactElement<PropsWithChildren<any>>[]
): ReactNode | null;


