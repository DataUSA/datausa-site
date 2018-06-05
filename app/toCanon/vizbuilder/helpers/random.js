/**
 * Returns a random, non-cryptographically secure, unique id string.
 * @returns {string}
 */
export function makeRandomId() {
  return (
    `id${
      Math.random()
        .toString(36)
        .substr(2, 5)}`
  );
}

/**
 * Chooses one random element from an array.
 * @template T
 * @param {Array<T>} list Array with the elements from where to pick one
 * @returns {T}
 */
export function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}
