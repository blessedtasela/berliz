import { clientOptionLabel, taskOptionLabel, userOptionLabel } from './option-labels';

describe('option labels', () => {
  it('words a user as name and email', () => {
    expect(userOptionLabel({ firstname: 'Jane', lastname: 'Doe', email: 'jane@x.com' })).toBe('Jane Doe — jane@x.com');
  });

  it('copes with a missing name or email', () => {
    expect(userOptionLabel({ email: 'jane@x.com' })).toBe('jane@x.com');
    expect(userOptionLabel({ firstname: 'Jane' })).toBe('Jane');
    expect(userOptionLabel(null)).toBe('');
  });

  it('words a client by the user it wraps', () => {
    expect(clientOptionLabel({ user: { firstname: 'Jo', lastname: 'Bo', email: 'jo@x.com' } })).toBe('Jo Bo — jo@x.com');
    expect(clientOptionLabel({ user: null })).toBe('');
    expect(clientOptionLabel(undefined)).toBe('');
  });

  it('words a task by its owner and description', () => {
    expect(taskOptionLabel({ userFirstname: 'Jo', userLastname: 'Bo', description: 'Leg day' })).toBe('Jo Bo — Leg day');
    expect(taskOptionLabel({ description: 'Leg day' })).toBe('Leg day');
    expect(taskOptionLabel(null)).toBe('');
  });
});
