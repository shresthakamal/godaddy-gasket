'use client';

import React from 'react';

function Error({ error }) {
  return (
    <p>
      { error?.message || 'An error occurred' }
    </p>
  );
}

export default Error;
