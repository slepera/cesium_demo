import { Injectable } from '@angular/core';
import { Coord } from './coord';
import { UtilityModule } from './utility/utility.module';

@Injectable({
  providedIn: 'root'
})
export class SubmarineService {
  private submarine_previous_position;
  constructor() { }

  updatePosition(entity, coordinates: Coord) {
    var position = new Cesium.Cartesian3.fromDegrees(
      coordinates.lon,
      coordinates.lat,
      70
    );
    var position2d = new Cesium.Cartesian3.fromDegrees(
      coordinates.lon,
      coordinates.lat,
      1000
    );
    var orientation = UtilityModule.Orientation(position2d, this.submarine_previous_position, 90, 180);
    entity.position = position;
    entity.orientation = orientation;
    this.submarine_previous_position = position2d;
  }
}
