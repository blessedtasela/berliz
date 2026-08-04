import { TodoList } from '../../models/todoList.interface';
import { FilterState } from '../../models/FilterState.interface';

function normalize(date: string | Date, endOfDay = false): number {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.getTime();
}

function applySortFilters(list: TodoList[], state: FilterState): TodoList[] {
  const now = new Date();
  const today = normalize(now);
  const yesterday = normalize(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

  return list.filter(t => {
    const baseDate = new Date(t.date);
    const itemDate = normalize(baseDate);
    const due = t.dueDate ? new Date(t.dueDate) : null;

    return state.selectedSorts.some(sort => {
      switch (sort) {
        case 'pending': return t.status === 'pending';
        case 'in-progress': return t.status === 'in-progress';
        case 'completed': return t.status === 'completed';
        case 'cancelled': return t.status === 'cancelled';
        case 'priority-high': return t.priority === 'high';
        case 'priority-normal': return t.priority === 'normal';
        case 'priority-low': return t.priority === 'low';
        case 'today': return itemDate === today;
        case 'yesterday': return itemDate === yesterday;
        case 'week':
          return (now.getTime() - baseDate.getTime()) <= 7 * 86400000;
        case 'month':
          return baseDate.getMonth() === now.getMonth() &&
            baseDate.getFullYear() === now.getFullYear();
        case 'recent':
          return (now.getTime() - baseDate.getTime()) <= 3 * 86400000;
        case 'overdue':
          return !!due && due.getTime() < today;
        case 'due-today':
          return !!due && normalize(due) === today;
        case 'all': return true;
        default: return false;
      }
    });
  });
}

// Ported from the legacy TodoStateService.filter() — fixed a live bug where it
// read t.user.firstName/lastName, but TodoList has no `user` field, only flat
// userFirstname/userLastname. That would throw at runtime on any text search.
export function filterTodos(list: TodoList[], state: FilterState): TodoList[] {
  let result = [...list];

  if (state.query?.trim()) {
    const words = state.query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    result = result.filter(t => {
      const fullName = `${t.userFirstname} ${t.userLastname}`.toLowerCase();
      const text = [t.task, t.status, t.priority || '', fullName].join(' ').toLowerCase();
      return words.every(w => text.includes(w));
    });
  }

  if (state.selectedSorts?.includes('exact-date') && state.exactDate) {
    const target = normalize(state.exactDate);
    result = result.filter(t => normalize(t.date) === target);
  }

  if (state.selectedSorts?.includes('range') && state.startDate && state.endDate) {
    const start = normalize(state.startDate);
    const end = normalize(state.endDate, true);
    result = result.filter(t => {
      const d = new Date(t.date).getTime();
      return d >= start && d <= end;
    });
  }

  if (state.selectedSorts?.length) {
    result = applySortFilters(result, state);
  }

  result = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return result;
}
