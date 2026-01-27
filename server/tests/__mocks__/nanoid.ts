/**
 * Mock for nanoid package
 * Used in tests to avoid ESM issues
 */

let counter = 0;

export const nanoid = (_size = 21): string => {
  counter++;
  return `mock-nanoid-${counter}-${Date.now().toString(36)}`;
};

export const customAlphabet = (alphabet: string, size: number) => {
  return () => {
    counter++;
    let result = '';
    for (let i = 0; i < size; i++) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  };
};

export default { nanoid, customAlphabet };
