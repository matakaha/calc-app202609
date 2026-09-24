import { useEffect, useReducer } from 'react';
import {
  calculatorReducer,
  initialCalculatorState,
  type CalculatorAction,
  type Operator,
} from './calculator';
import './styles.css';

type Key = { label: string; action: CalculatorAction; className?: string; ariaLabel?: string };

const keys: Key[] = [
  { label: 'MC', action: { type: 'memory-clear' }, className: 'memory' },
  { label: 'MR', action: { type: 'memory-recall' }, className: 'memory' },
  { label: 'M−', action: { type: 'memory-subtract' }, className: 'memory' },
  { label: 'M+', action: { type: 'memory-add' }, className: 'memory' },
  { label: 'AC', action: { type: 'clear' }, className: 'utility' },
  { label: 'DEL', action: { type: 'delete' }, className: 'utility', ariaLabel: '最後の1桁を削除' },
  { label: '+/−', action: { type: 'toggle-sign' }, className: 'utility', ariaLabel: '符号を反転' },
  { label: '÷', action: { type: 'operator', operator: '÷' }, className: 'operator' },
  { label: '7', action: { type: 'digit', digit: '7' } },
  { label: '8', action: { type: 'digit', digit: '8' } },
  { label: '9', action: { type: 'digit', digit: '9' } },
  { label: '×', action: { type: 'operator', operator: '×' }, className: 'operator' },
  { label: '4', action: { type: 'digit', digit: '4' } },
  { label: '5', action: { type: 'digit', digit: '5' } },
  { label: '6', action: { type: 'digit', digit: '6' } },
  { label: '−', action: { type: 'operator', operator: '-' }, className: 'operator' },
  { label: '1', action: { type: 'digit', digit: '1' } },
  { label: '2', action: { type: 'digit', digit: '2' } },
  { label: '3', action: { type: 'digit', digit: '3' } },
  { label: '+', action: { type: 'operator', operator: '+' }, className: 'operator' },
  { label: '%', action: { type: 'percent' }, className: 'utility' },
  { label: '0', action: { type: 'digit', digit: '0' }, className: 'zero' },
  { label: '.', action: { type: 'decimal' } },
  { label: '=', action: { type: 'equals' }, className: 'equals' },
];

function keyboardAction(event: KeyboardEvent): CalculatorAction | null {
  if (/^[0-9]$/.test(event.key)) return { type: 'digit', digit: event.key };
  if (event.key === '.') return { type: 'decimal' };
  if (event.key === '+' || event.key === '-') return { type: 'operator', operator: event.key as Operator };
  if (event.key === '*' || event.key.toLowerCase() === 'x') return { type: 'operator', operator: '×' };
  if (event.key === '/') return { type: 'operator', operator: '÷' };
  if (event.key === 'Enter' || event.key === '=') return { type: 'equals' };
  if (event.key === 'Escape') return { type: 'clear' };
  if (event.key === 'Backspace') return { type: 'delete' };
  if (event.key === '%') return { type: 'percent' };
  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = keyboardAction(event);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="電卓">
        <header className="calculator-header">
          <span className="brand">CALCULATOR</span>
          <span className={`memory-indicator ${state.memory !== 0 ? 'active' : ''}`} aria-label={state.memory !== 0 ? 'メモリに値あり' : 'メモリは空'}>
            M
          </span>
        </header>
        <output className={`display ${state.error ? 'error' : ''}`} aria-live="polite" aria-label="計算結果">
          {state.display}
        </output>
        <div className="keypad">
          {keys.map((key) => (
            <button
              key={key.label}
              type="button"
              className={`key ${key.className ?? ''}`}
              onClick={() => dispatch(key.action)}
              aria-label={key.ariaLabel ?? key.label}
            >
              {key.label}
            </button>
          ))}
        </div>
        <p className="keyboard-hint">キーボードでも入力できます</p>
      </section>
    </main>
  );
}
