import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Cartesian3 } from 'cesium';

@Injectable({
  providedIn: 'root'
})
export class SatelliteService {

  constructor(private _snackBar: MatSnackBar) { }

  AddPolar(viewer) {
    var positions_polar: Array<Cartesian3> = new Array<Cartesian3>();
    for (let i = 0; i < 360; i++) {
      positions_polar.push(Cesium.Cartesian3.fromDegrees(i, 0, 1000000));
    }
    viewer.entities.add({
      polyline: {
        positions: positions_polar
      }
    });
  }

  AddEquatorial(viewer) {
    var positions_equatorial: Array<Cartesian3> = new Array<Cartesian3>();
    for (let i = 0; i < 360; i++) {
      positions_equatorial.push(Cesium.Cartesian3.fromDegrees(0, i, 1000000));
    }
    viewer.entities.add({
      polyline: {
        positions: positions_equatorial
      }
    });
  }

  openSnackBar(message: string) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.horizontalPosition = 'left';
    config.duration = 0;
    this._snackBar.open(message, 'Close', config);
  }
}
