import { Injectable } from '@angular/core';
import { Coord } from './coord';
import { UtilityModule } from './utility/utility.module';

@Injectable({
  providedIn: 'root'
})
export class DronesService {
  private drone_previous_position;
  constructor() { }

  updatePosition(entity, cone, dataCircle, coordinates: Coord) {
    var position = new Cesium.Cartesian3.fromDegrees(
      coordinates.lon,
      coordinates.lat,
      coordinates.alt
    );
    var conePosition = new Cesium.Cartesian3.fromDegrees(
      coordinates.lon,
      coordinates.lat,
      coordinates.alt / 2
    );
    var circlePosition = new Cesium.Cartesian3.fromDegrees(
      coordinates.lon,
      coordinates.lat,
      70
    );
    var orientation = UtilityModule.Orientation(position, this.drone_previous_position, 0);
    entity.position = position;
    entity.orientation = orientation;
    dataCircle.position = circlePosition;
    cone.position = conePosition;
    cone.cylinder.length = coordinates.alt;
    this.drone_previous_position = position;
    //cone.cylinder.bottomRadius = coordinates.alt/2;
  }
}
