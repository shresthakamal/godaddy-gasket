import React, { ComponentType, Fragment } from 'react';

interface HtmlWrapperProps {
  html: string;
}

export function HtmlWrapper({ html }: HtmlWrapperProps) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export const defaultComponents: Record<string, ComponentType<any>> = {
  HtmlWrapper,
  Fragment
};
