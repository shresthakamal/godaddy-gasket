/* eslint-disable max-statements, complexity */
const withPatchSpinner = require('../with-patch-spinner');

const reJS = /\.[tj]sx?$/;
const reHOC = /withLocaleRequired\(([^)]+)?\)/g;
const reCommaSep = /,(?:\s?)+/;

const reLocalePath = /^['"]\/\w+/;
const reString = /^['"]/;
const reArray = /^\[['"]\w+/;
const reOptions = /(.+),\s+({.+)/;
const reNamespace = /['"]([^.]+)?\.([^.]+)['"]/;
const reObject = /\{\s?(?:module:\s?([^,}]+))?,?\s?(?:namespace:\s?([^,}]+))?/;

const strStrip = str => str.slice(1, str.length - 1);

function isDefault(id, pkgName) {
  const idStr = strStrip(id);
  return idStr === pkgName        // if it matches package name, assume default
    && !idStr.startsWith('@hui'); // special case for @hui packages
}

function formatStrId(identifier, pkgName) {
  return isDefault(identifier, pkgName) ? '\'/locales\'' : prependLocales(identifier, '/locales/modules/');
}

function formatSplitStrId(identifier, pkgName) {
  const match = reNamespace.exec(identifier);
  if (match) {
    const root = !match[1] ? '/locales' : strStrip(formatStrId(`'${ match[1] }'`, pkgName));
    return `'${ root }/:locale/${ match[2] }.json'`;
  }
}

function format(identifier, pkgName) {
  return formatSplitStrId(identifier, pkgName) || formatStrId(identifier, pkgName);
}

function prependLocales(id, root = '/locales/') {
  const start = id[0];
  return `${ start }${ root }${ id.slice(1) }`;
}

function fixIdentifier(identifier, pkgName) {
  // is empty or already a locales path
  if (!identifier || reLocalePath.test(identifier)) {
    return identifier;
  }

  if (reString.test(identifier)) {
    return format(identifier, pkgName);
  }

  if (reArray.test(identifier)) {
    const arr = identifier.slice(1, identifier.length - 1).split(reCommaSep);
    const fixedArr = arr.map(id => {
      return format(id, pkgName);
    });

    return `[${ fixedArr.join(', ') }]`;
  }

  const objMatch = reObject.exec(identifier);
  if (objMatch) {
    const [, module, namespace] = objMatch;
    const arr = [module];
    if (namespace) arr.push(namespace);
    // format our matched object parts to string style
    const idStr = `'${ arr.map(part => part && strStrip(part.trim())).join('.') }'`;
    return format(idStr, pkgName);
  }

  return identifier;
}

function transform(content, pkgName, messages, initialProps) {
  return content.replace(reHOC, function replaceOptions(match, args) {
    let identifier = args;
    let options;
    const argMatch = reOptions.exec(args);
    if (argMatch) {
      identifier = argMatch[1];
      options = argMatch[2];
    }

    let fixed;

    // if no args or edge case null identifier with options
    if (!args || identifier === 'null') {
      fixed = '\'/locales\'';
    } else {
      fixed = fixIdentifier(identifier, pkgName);
    }

    // if there's no change, and we don't have a empty default identifier
    if (identifier && fixed === identifier && !identifier.includes('/locales')) {
      messages.push(`Could not fixup localePath for \`${ match }\``);
    }

    if (options) {
      if (initialProps && !options.includes('initialProps')) {
        options = options.replace('{', '{ initialProps: true,');
      }
      return match.replace(args, `${ fixed }, ${ options }`);
    }

    if (initialProps) {
      fixed += ', { initialProps: true }';
    }

    // replace default (no options) with shorthand
    if (fixed === '\'/locales\'') {
      fixed = '';
    }

    // if originally empty args
    if (fixed && !args) {
      return match.replace('(', '(' + fixed);
    }

    return match.replace(args, fixed);
  });
}

/**
 * Finds all the packages and fixes them up
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {string[]} messages - Messages to report
 */
function fixupLocaleRequired({ files, messages }) {
  const pkg = files.get('package.json');

  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      if (reJS.test(filePath)) {
        const initialProps = filePath.includes('pages/');
        files.set(filePath, transform(content, pkg.name, messages, initialProps));
      }
    }
  });
}

module.exports = withPatchSpinner('Update locale paths', fixupLocaleRequired);
