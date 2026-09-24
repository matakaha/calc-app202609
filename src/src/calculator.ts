export type Operator = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  display: string;
  storedValue: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  memory: number;
  error: boolean;
  justCalculated: boolean;
}

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'delete' }
  | { type: 'toggle-sign' }
  | { type: 'percent' }
  | { type: 'memory-add' }
  | { type: 'memory-subtract' }
  | { type: 'memory-recall' }
  | { type: 'memory-clear' };

const MAX_DISPLAY_LENGTH = 8;
const ERROR_DISPLAY = '0 DIV';

export const initialCalculatorState: CalculatorState = {
  display: '0',
  storedValue: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  error: false,
  justCalculated: false,
};

function roundToDisplay(value: number): number {
  if (!Number.isFinite(value)) return value;
  const magnitude = Math.abs(value);
  if (magnitude === 0) return 0;
  const integerDigits = magnitude >= 1 ? Math.floor(Math.log10(magnitude)) + 1 : 0;
  const signLength = value < 0 ? 1 : 0;
  const prefixLength = integerDigits > 0 ? integerDigits + 1 : 2;
  const decimalPlaces = Math.max(0, MAX_DISPLAY_LENGTH - signLength - prefixLength);
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON * value) * factor) / factor;
}

export function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return ERROR_DISPLAY;
  const rounded = roundToDisplay(value);
  let formatted = Object.is(rounded, -0) ? '0' : String(rounded);

  if (formatted.length <= MAX_DISPLAY_LENGTH) return formatted;

  const exponential = rounded.toExponential(MAX_DISPLAY_LENGTH - 5);
  if (exponential.length <= MAX_DISPLAY_LENGTH) return exponential.replace('+', '');

  return rounded.toPrecision(MAX_DISPLAY_LENGTH).replace(/\.?0+e/, 'e');
}

function currentValue(state: CalculatorState): number {
  const parsed = Number(state.display);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculate(left: number, operator: Operator, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? Number.NaN : left / right;
  }
}

function withResult(state: CalculatorState, value: number): CalculatorState {
  if (!Number.isFinite(value)) {
    return { ...state, display: ERROR_DISPLAY, error: true, waitingForOperand: true, justCalculated: false };
  }

  return {
    ...state,
    display: formatDisplay(value),
    storedValue: null,
    operator: null,
    waitingForOperand: true,
    justCalculated: true,
  };
}

function applyPercent(state: CalculatorState): CalculatorState {
  const value = currentValue(state);
  if (state.storedValue !== null && state.operator) {
    return { ...state, display: formatDisplay((state.storedValue * value) / 100), waitingForOperand: true };
  }
  return { ...state, display: formatDisplay(value / 100), waitingForOperand: true };
}

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  if (action.type === 'clear') {
    return { ...initialCalculatorState, memory: state.memory };
  }

  if (action.type === 'memory-clear') {
    return { ...state, memory: 0 };
  }

  if (state.error) {
    if (action.type === 'digit' || action.type === 'decimal') {
      return calculatorReducer({ ...initialCalculatorState, memory: state.memory }, action);
    }
    return state;
  }

  if (action.type === 'memory-add' || action.type === 'memory-subtract') {
    const amount = currentValue(state);
    return { ...state, memory: action.type === 'memory-add' ? state.memory + amount : state.memory - amount };
  }

  if (action.type === 'memory-recall') {
    return { ...state, display: formatDisplay(state.memory), waitingForOperand: true, justCalculated: false };
  }

  if (action.type === 'digit') {
    const startNew = state.waitingForOperand || state.justCalculated;
    const display = startNew || state.display === '0' ? action.digit : `${state.display}${action.digit}`;
    return { ...state, display: display.slice(0, MAX_DISPLAY_LENGTH), waitingForOperand: false, justCalculated: false };
  }

  if (action.type === 'decimal') {
    if (state.waitingForOperand || state.justCalculated) {
      return { ...state, display: '0.', waitingForOperand: false, justCalculated: false };
    }
    if (state.display.includes('.')) return state;
    if (state.display.length >= MAX_DISPLAY_LENGTH) return state;
    return { ...state, display: `${state.display}.` };
  }

  if (action.type === 'delete') {
    if (state.waitingForOperand || state.justCalculated) return state;
    const display = state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))
      ? '0'
      : state.display.slice(0, -1);
    return { ...state, display };
  }

  if (action.type === 'toggle-sign') {
    if (state.display === '0') return state;
    const display = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`;
    return display.length > MAX_DISPLAY_LENGTH ? state : { ...state, display };
  }

  if (action.type === 'percent') return applyPercent(state);

  if (action.type === 'operator') {
    const value = currentValue(state);
    if (state.operator && state.storedValue !== null && !state.waitingForOperand) {
      const result = calculate(state.storedValue, state.operator, value);
      if (!Number.isFinite(result)) return withResult(state, result);
      return { ...state, display: formatDisplay(result), storedValue: result, operator: action.operator, waitingForOperand: true, justCalculated: false };
    }
    return { ...state, storedValue: value, operator: action.operator, waitingForOperand: true, justCalculated: false };
  }

  if (action.type === 'equals') {
    if (state.operator === null || state.storedValue === null) return state;
    return withResult(state, calculate(state.storedValue, state.operator, currentValue(state)));
  }

  return state;
}
