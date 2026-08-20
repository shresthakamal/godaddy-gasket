/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

const withPatchSpinner = require('../with-patch-spinner');

const content = `import React from 'react';
import PropTypes from 'prop-types';

export default function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? \`A \${ statusCode } error occurred on server\`
        : 'An error occurred on client'}
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  let statusCode = 404;
  if (res) {
    statusCode = res.statusCode;
  } else if (err) {
    statusCode = err.statusCode;
  }

  return { statusCode };
};

Error.propTypes = {
  statusCode: PropTypes.number
};`;

async function addErrorPage({ cwd }) {
  const errorPage = path.join(cwd, 'pages/_error.js');

  if (!fs.existsSync(errorPage)) {
    await fs.promises.writeFile(errorPage, content, 'utf8');
  }
}

module.exports = withPatchSpinner('Add custom error page', addErrorPage);
