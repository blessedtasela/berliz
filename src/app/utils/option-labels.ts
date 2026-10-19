/** Labels for the searchable pickers, so every form words "who/what is this" the same way. */

interface Named {
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
}

/** "Jane Doe — jane@x.com": the name is what people search by, the email tells two Janes apart. */
export function userOptionLabel(user: Named | null | undefined): string {
  if (!user) return '';
  const name = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim();
  return [name, user.email].filter(Boolean).join(' — ');
}

/** A client record that wraps a user. */
export function clientOptionLabel(client: { user?: Named | null } | null | undefined): string {
  return userOptionLabel(client?.user);
}

/** "Jane Doe — Leg day plan" for a task, led by whose it is. */
export function taskOptionLabel(task: { userFirstname?: string | null; userLastname?: string | null; description?: string | null } | null | undefined): string {
  if (!task) return '';
  const owner = `${task.userFirstname ?? ''} ${task.userLastname ?? ''}`.trim();
  return [owner, task.description].filter(Boolean).join(' — ');
}
