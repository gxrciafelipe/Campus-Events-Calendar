/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function declarations(block: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) result.set(name, value.trim().toLowerCase());
  }
  return result;
}

const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
const light = declarations(css.slice(0, darkStart));
const dark = declarations(css.slice(darkStart));

const documented: Record<string, [light: string, dark: string]> = {
  '--bg': ['#ffffff', '#0e1218'],
  '--bg-subtle': ['#f3f5f8', '#171c24'],
  '--text': ['#141a22', '#e9edf3'],
  '--text-muted': ['#566072', '#9ba5b6'],
  '--line': ['#d5dae3', '#2c3440'],
  '--line-strong': ['#7c8696', '#6f7a8c'],
  '--primary': ['#0e4c90', '#8db9f4'],
  '--on-primary': ['#ffffff', '#0e1218'],
  '--accent': ['#ffd200', '#ffd200'],
  '--on-accent': ['#141a22', '#141a22'],
  '--accent-edge': ['#947900', '#ffd200'],
  '--danger': ['#b3261e', '#ff9c94'],
};

const labels: Record<string, [light: string, dark: string]> = {
  teal: ['#0b6b6b', '#5fd0c8'],
  green: ['#2c6a1e', '#8fd47a'],
  purple: ['#6b3fa0', '#c3a6f2'],
  magenta: ['#a3246f', '#f29ac8'],
  orange: ['#964800', '#ffb067'],
  olive: ['#5a5f00', '#c9cf6a'],
  brown: ['#7a4a21', '#e0b48c'],
  slate: ['#4a5568', '#b4becd'],
};

describe('tokens.css', () => {
  it.each(Object.keys(documented))(
    'defines %s with the documented values in both modes',
    (token) => {
      const expected = documented[token];
      expect(light.get(token)).toBe(expected?.[0]);
      expect(dark.get(token)).toBe(expected?.[1]);
    },
  );

  it.each(Object.keys(labels))('defines the %s label color in both modes', (key) => {
    const expected = labels[key];
    expect(light.get(`--label-${key}`)).toBe(expected?.[0]);
    expect(dark.get(`--label-${key}`)).toBe(expected?.[1]);
  });

  it('defines exactly the eight label keys', () => {
    const keys = [...light.keys()].filter((name) => name.startsWith('--label-'));
    expect(keys.sort()).toEqual(
      Object.keys(labels)
        .map((key) => `--label-${key}`)
        .sort(),
    );
  });
});
