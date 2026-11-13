export interface PromptData {
  title?: string;
  message?: string;
  confirmation?: boolean;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  /** Small line under the title. A confirmation shows "This action may be irreversible" unless this is set or it is a login prompt. */
  subtitle?: string;
  /** When set, shows a required free-text field and emits its trimmed value (instead of `true`) on confirm. */
  requireReason?: boolean;
  /** Label above the free-text field. Defaults to "Reason". */
  reasonLabel?: string;
  reasonPlaceholder?: string;
}