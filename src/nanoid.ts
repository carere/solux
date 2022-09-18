/**
 * Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
 * This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
 * optimize the gzip compression for this alphabet.
 *
 * @param size The size of the unique id
 * @returns the ids
 * */
export const nanoid = (size = 21) => {
  const urlAlphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'
  let id = ''
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}
