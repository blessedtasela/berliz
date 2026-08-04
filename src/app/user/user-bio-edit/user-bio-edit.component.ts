import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-bio-edit',
  templateUrl: './user-bio-edit.component.html',
  styleUrls: ['./user-bio-edit.component.css']
})
export class UserBioEditComponent {

  @Input() form!: FormGroup;
  @Output() save = new EventEmitter<void>();

  onSaveClick() {
    this.save.emit();
  }

    isInvalid(field: string): boolean {
  const ctrl = this.form.get(field);
  return !!ctrl?.invalid && (!!ctrl?.touched || ctrl?.dirty);
}

isValid(field: string): boolean {
  const ctrl = this.form.get(field);
  return !!ctrl?.valid && !!ctrl?.touched;
}

charCount(field: string): number {
  return this.form.get(field)?.value?.length ?? 0;
}

charCountClass(field: string, min: number, max: number): string {
  const len = this.charCount(field);
  if (len < min) return 'text-red-500';
  if (len <= max) return 'text-green-600';
  return 'text-orange-500';
}

get canSave(): boolean {
  return this.form?.valid && this.form?.dirty;
}

}