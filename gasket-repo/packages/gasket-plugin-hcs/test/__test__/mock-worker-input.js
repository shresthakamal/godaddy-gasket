
import React from 'react';

export default {
  Header: () => React.createElement('div', null, 'hello world'),
  Footer: (props) => React.createElement('div', null, props.testTitle),
  AnotherLibraryExport: () => React.createElement('div', null, 'hello library export')
};

export const Header = () => React.createElement('div', null, 'hello world');
export const Footer = (props) => React.createElement('div', null, props.testTitle);
export const AnotherLibraryExport = () => React.createElement('div', null, 'hello library export');
