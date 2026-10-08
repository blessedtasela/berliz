import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { PublicAchievement } from 'src/app/models/fitness-achievement.model';

/**
 * The "Achievements" section of a public or dashboard profile. Renders nothing when there are none, so a
 * profile without any (or a private one, where the server sends none) looks exactly as it did before.
 */
@Component({
    selector: 'app-profile-achievements',
    imports: [CommonModule, IconsModule],
    template: `
    <div *ngIf="achievements?.length" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Achievements</h2>
            <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{{ achievements!.length }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div *ngFor="let a of achievements; trackBy: trackById"
                class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-1.5">
                <div class="flex items-start gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 flex items-center justify-center shrink-0">
                        <i-feather name="award" class="text-amber-600" style="width:14px;height:14px;"></i-feather>
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">{{ a.name }}</p>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ a.date | date:'mediumDate' }}</p>
                    </div>
                </div>
                <p *ngIf="a.description" class="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line break-words">{{ a.description }}</p>
                <p *ngIf="a.hasCertificate" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <i-feather name="check-circle" style="width:11px;height:11px;"></i-feather>
                    Certificate on file
                </p>
            </div>
        </div>
    </div>
  `
})
export class ProfileAchievementsComponent {
  @Input() achievements: PublicAchievement[] | null | undefined = null;

  trackById(_: number, a: PublicAchievement): number {
    return a.id;
  }
}
