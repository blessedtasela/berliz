import { RequestActivityService } from '../services/request-activity.service';

/**
 * Cancels a form's second submit while its first is still in flight.
 *
 * Capture-phase listener on the document, so it runs before Angular's own `ngSubmit` handler. After an allowed submit it
 * waits one tick to see whether the submit actually started a create/update/delete request; if so the form is marked
 * `data-submitting` (styled dim by styles.css) and further submits are swallowed until the request settles. A submit
 * that fails validation starts no request, so the form is never locked.
 */
export function installDoubleSubmitGuard(doc: Document, activity: RequestActivityService): () => void {
  const locked = new WeakSet<HTMLFormElement>();

  const onSubmit = (event: Event): void => {
    const form = event.target as HTMLFormElement | null;
    if (!form || form.tagName !== 'FORM') return;

    if (locked.has(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    setTimeout(() => {
      if (!activity.busy) return;
      locked.add(form);
      form.setAttribute('data-submitting', 'true');
      activity.onIdleOnce(() => {
        locked.delete(form);
        form.removeAttribute('data-submitting');
      });
    }, 0);
  };

  doc.addEventListener('submit', onSubmit, true);
  return () => doc.removeEventListener('submit', onSubmit, true);
}
