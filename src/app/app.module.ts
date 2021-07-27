import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserManagementComponent } from './user-management/user-management.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MonitorControlComponent } from './monitor-control/monitor-control.component';
import { AngularCesiumModule } from 'angular-cesium';
import { AngularCesiumWidgetsModule } from 'angular-cesium';
import { CesiumDirective } from './cesium.directive';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DataChartComponent } from './data-chart/data-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { WebsocketService } from './websocket.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule }  from '@angular/material/menu';
import { NgxGaugeModule } from 'ngx-gauge';
import { GaugeComponent } from './gauge/gauge.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    UserManagementComponent,
    MainMenuComponent,
    MonitorControlComponent,
    CesiumDirective,
    DataChartComponent,
    GaugeComponent
  ],
  imports: [
    MatCheckboxModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgApexchartsModule,
    AngularCesiumModule.forRoot(),
    HttpClientModule,
    AngularCesiumWidgetsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    PortalModule,
    MatSlideToggleModule,
    MatMenuModule,
    NgxGaugeModule,
    MatDialogModule
  ],
  exports: [OverlayModule],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
