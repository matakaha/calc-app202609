import { describe, expect, it } from 'vitest';
import {
  calculatorReducer,
  formatDisplay,
  initialCalculatorState,
  type CalculatorAction,
  type CalculatorState,
} from './calculator';

function run(...actions: CalculatorAction[]): CalculatorState {
  return actions.reduce(calculatorReducer, initialCalculatorState);
}

const digit = (value: string): CalculatorAction => ({ type: 'digit', digit: value });
const operator = (value: '+' | '-' | '×' | '÷'): CalculatorAction => ({ type: 'operator', operator: value });

describe('calculatorReducer', () => {
  it('calculates basic arithmetic', () => {
    expect(run(digit('1'), digit('2'), operator('+'), digit('3'), { type: 'equals' }).display).toBe('15');
    expect(run(digit('8'), operator('÷'), digit('2'), { type: 'equals' }).display).toBe('4');
  });

  it('replaces consecutive operators with the newest operator', () => {
    expect(run(digit('8'), operator('+'), operator('×'), digit('2'), { type: 'equals' }).display).toBe('16');
  });

  it('calculates percentages from the stored value', () => {
    expect(run(digit('1'), digit('0'), digit('0'), operator('+'), digit('1'), digit('0'), { type: 'percent' }, { type: 'equals' }).display).toBe('110');
  });

  it('supports memory operations', () => {
    const state = run(digit('2'), { type: 'memory-add' }, { type: 'clear' }, { type: 'memory-recall' });
    expect(state.display).toBe('2');
    expect(run(digit('2'), { type: 'memory-add' }, { type: 'clear' }, digit('3'), { type: 'memory-subtract' }, { type: 'memory-recall' }).display).toBe('-1');
  });

  it('handles zero division explicitly', () => {
    const state = run(digit('7'), operator('÷'), digit('0'), { type: 'equals' });
    expect(state.display).toBe('0 DIV');
    expect(state.error).toBe(true);
  });

  it('supports deletion and sign changes', () => {
    expect(run(digit('1'), digit('2'), { type: 'delete' }).display).toBe('1');
    expect(run(digit('2'), { type: 'toggle-sign' }).display).toBe('-2');
  });
});

describe('formatDisplay', () => {
  it('rounds values to a displayable eight-character value', () => {
    expect(formatDisplay(123456789)).toBe('1.235e8');
    expect(formatDisplay(1.23456789)).toBe('1.234568');
    expect(formatDisplay(-0)).toBe('0');
  });
});
