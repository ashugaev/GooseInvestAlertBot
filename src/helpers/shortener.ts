import { get, set } from 'lodash';

const COMMON_SHORT_STRINGS_PATH = 'session.commonData.shortStrings';

/**
 * Save short version of string in session storage
 */
export const shortenerCreateShort = (fullString, ctx) => {
  const shortStrings = get(ctx, COMMON_SHORT_STRINGS_PATH) ?? [];

  let index = shortStrings.findIndex(el => el === fullString);

  if (index === -1) {
    index = shortStrings.push(fullString) - 1;

    set(ctx, COMMON_SHORT_STRINGS_PATH, shortStrings);
  } else {
    shortStrings[index] = fullString;
  }

  return index.toString();
};

/**
 * Returns full version of string by short
 */
export const shortenerGetFull = (shortString, ctx) => {
  const shortStrings = get(ctx, COMMON_SHORT_STRINGS_PATH);

  const fullString = shortStrings[shortString];

  return (fullString === undefined) ? null : fullString;
};
