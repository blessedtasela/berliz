import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { AvatarComponent } from 'src/app/shared/avatar/avatar.component';
import { PostResponse } from 'src/app/models/post.interface';
import { PostService } from 'src/app/services/post.service';

/**
 * A teaser for the Timeline feature on the Overview page -- deliberately NOT
 * the full feed (that's what /dashboard/timeline is for). Shows a taste of
 * a few recent posts from you and your connections, with a clear invitation
 * to go see the rest, rather than duplicating the whole feed here.
 */
@Component({
  selector: 'app-dashboard-timeline-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, AvatarComponent],
  templateUrl: './dashboard-timeline-preview.component.html',
})
export class DashboardTimelinePreviewComponent implements OnInit {

  posts: PostResponse[] = [];
  loading = true;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.postService.getFeed().subscribe({
      next: res => {
        this.posts = (res.data ?? []).slice(0, 3);
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }
}
