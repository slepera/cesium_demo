import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataChartComponent } from './data-chart/data-chart.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MonitorControlComponent } from './monitor-control/monitor-control.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  { path: 'home', component: MainMenuComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'monitor-control', component: MonitorControlComponent },
  { path: 'data', component: DataChartComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: MainMenuComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
