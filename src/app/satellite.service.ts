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
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  openSnackBar(message: string) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.horizontalPosition = 'left';
    config.duration = 0;
    this._snackBar.open(message, 'Close', config);
  }

  async simulateOrbit(viewer){
    var satellite = viewer.entities.add({
      name: 'SAT-1',
      position: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 1000000.0),
      billboard: {
        image: 'assets/satellite1-64.png'
      }
    });

    let i = 0;

    while (true) {
      var position = Cesium.Cartesian3.fromDegrees(i, 0.0, 1000000.0);
      satellite.position = position;
      await this.delay(500);
      i++;
      if (i == 360) {
        i = 0;
      }
    }
  }

  handleSatellite(scene, _this, handler){
    handler.setInputAction(function (click) {
      var pickedObject = scene.pick(click.position);
      if (Cesium.defined(pickedObject) && (pickedObject.id.billboard)) {
        console.log(pickedObject.id.name);
        if (pickedObject.id.billboard.image._value == 'assets/satellite1-64.png') {
          if ((_this.lastPickedEntity != null) && (_this.lastPickedEntity.id.name != pickedObject.id.name)) {
            _this.lastPickedEntity.id.billboard.image = 'assets/satellite1-64.png';
          }
          _this.lastPickedEntity = pickedObject;
          pickedObject.id.billboard.image = 'assets/satellite1-128.png';
          _this.satService.openSnackBar(pickedObject.id.name);
        }
        else {
          pickedObject.id.billboard.image = 'assets/satellite1-64.png';
        }
      }
      else {
        if (_this.lastPickedEntity != null) {
          _this.lastPickedEntity.id.billboard.image = 'assets/satellite1-64.png';
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
