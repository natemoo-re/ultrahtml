import { describe, test, expect } from "vitest";
import { isBalanced } from '../src/balancer';

describe('isBalanced', () => {
  test('Empty string', () => {
    expect(isBalanced('')).toBe(true);
  });

  test('Balanced brackets', () => {
    expect(isBalanced('()')).toBe(true);
    expect(isBalanced('()[]{}')).toBe(true);
    expect(isBalanced('([{}])')).toBe(true);
  });

  test('Unbalanced brackets', () => {
    expect(isBalanced('(')).toBe(false);
    expect(isBalanced(')')).toBe(false);
    expect(isBalanced('(]')).toBe(false);
    expect(isBalanced('([)]')).toBe(false);
  });

  test('Escaped brackets', () => {
    expect(isBalanced('\\(\\{\\[')).toBe(true);
    expect(isBalanced('\\(\\)\\[\\]\\{\\}')).toBe(true);
    expect(isBalanced('(\\{\\[)')).toBe(true);
    expect(isBalanced('this\\(is\\{balanced\\[')).toBe(true);
  });

  test('Brackets in strings', () => {
    expect(isBalanced('"()"')).toBe(true);
    expect(isBalanced("'()'")).toBe(true);
    expect(isBalanced('const str = "(["')).toBe(true);
  });

  test('Escaped characters in strings', () => {
    expect(isBalanced('"\\""')).toBe(true);
    expect(isBalanced("'\\''")).toBe(true);
    expect(isBalanced('const str = "(\\"["')).toBe(true);
  });

  test('Comments', () => {
    expect(isBalanced('// )')).toBe(true);
    expect(isBalanced('/* } */')).toBe(true);
    expect(isBalanced('// (\nconst x = 1;')).toBe(true);
  });

  test('Regular expressions', () => {
    expect(isBalanced('/\\(/')).toBe(true);
    expect(isBalanced('const regex = /\\[/g')).toBe(true);
  });

  test('Escaped brackets in strings', () => {
    expect(isBalanced('const str = "\\(\\)\\[\\]\\{\\}";')).toBe(true);
    expect(isBalanced("const str = '\\(\\)\\[\\]\\{\\}';")).toBe(true);
  });

  test('Escaped quotes in strings', () => {
    expect(isBalanced('const str = "He said \\"Hello\\" and left.";')).toBe(true);
    expect(isBalanced("const str = 'It\\'s a nice day';")).toBe(true);
  });

  test('Multi-line strings', () => {
    expect(isBalanced(`
      const str = "This is a \\
      multi-line string with (brackets)";
    `)).toBe(true);
  });

  test('Complex code snippets', () => {
    expect(isBalanced(`
      function test() {
        const str = "({[]})";
        // Comment (])
        return str.match(/\\(/g);
      }
    `)).toBe(true);

    expect(isBalanced(`
      const obj = {
        key: '(]',
        nested: {
          array: [1, 2, 3]
        }
      };
      /* Multi-line
         comment } */
      console.log(obj);
    `)).toBe(true);
  });

  test('Unbalanced complex code', () => {
    expect(isBalanced(`
      function broken( {
        const str = "(unmatched";
        return str;
      }
    `)).toBe(false);
  });
});
