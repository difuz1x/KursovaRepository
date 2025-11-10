import { describe, it, expect } from 'vitest';
import { compareTasks, computeDateTotals, willExceedDailyLimit } from '../utils';
import type { TaskType } from '../types/TaskType';

const makeTask = (overrides: Partial<TaskType> = {}): TaskType => ({
  id: Math.random().toString(36).slice(2),
  title: 't',
  priority: 'medium',
  isCompleted: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('compareTasks', () => {
  it('sorts by time descending when sortBy=time', () => {
    const a = makeTask({ estimatedMinutes: 30 });
    const b = makeTask({ estimatedMinutes: 120 });
    const res = compareTasks(a, b, 'time');
    expect(res).toBeGreaterThan(0); // b (120) should come before a (30)
  });

  it('falls back to date when times equal', () => {
    const d1 = new Date('2025-11-10T10:00:00Z').toISOString();
    const d2 = new Date('2025-11-09T10:00:00Z').toISOString();
    const a = makeTask({ estimatedMinutes: 60, dueDate: d1 });
    const b = makeTask({ estimatedMinutes: 60, dueDate: d2 });
    const res = compareTasks(a, b, 'time');
    expect(res).toBeGreaterThan(0); // b's date earlier => b before a -> positive
  });
});

describe('computeDateTotals / willExceedDailyLimit', () => {
  it('computes totals per date', () => {
    const t1 = makeTask({ dueDate: new Date('2025-11-10T08:00:00Z').toISOString(), estimatedMinutes: 60 });
    const t2 = makeTask({ dueDate: new Date('2025-11-10T12:00:00Z').toISOString(), estimatedMinutes: 120 });
    const totals = computeDateTotals([t1, t2]);
    expect(totals.get('2025-11-10')).toBe(180);
  });

  it('detects exceeding daily limit', () => {
    const base = makeTask({ dueDate: new Date('2025-11-11T08:00:00Z').toISOString(), estimatedMinutes: 1400 });
    const will = willExceedDailyLimit([base], '2025-11-11', 60);
    expect(will).toBe(true);
    const wont = willExceedDailyLimit([base], '2025-11-11', 39);
    expect(wont).toBe(false);
  });
});
