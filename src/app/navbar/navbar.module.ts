import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { IconsModule } from '../icons/icons.module';
import { RouterModule } from '@angular/router';
import { SidebarNavigationComponent } from './sidebar-navigation/sidebar-navigation.component';


@NgModule({
  declarations: [
    NavigationBarComponent,
    SidebarNavigationComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule
  ],
  exports: [
    NavigationBarComponent,
    SidebarNavigationComponent
  ]
})
export class NavbarModule { }
