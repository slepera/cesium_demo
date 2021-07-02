import { Injectable } from '@angular/core';
import { Coord } from './coord';

@Injectable({
  providedIn: 'root'
})
export class DronesService {

  constructor() { }

  updatePosition(entity, cone, coordinates: Coord){
    var position = new  Cesium.Cartesian3.fromDegrees(
      coordinates.lat,
      coordinates.lon,
      coordinates.alt
    );
    var conePosition = new  Cesium.Cartesian3.fromDegrees(
      coordinates.lat,
      coordinates.lon,
      coordinates.alt/2
    );
    var hpr = new Cesium.HeadingPitchRoll(coordinates.heading, coordinates.pitch, coordinates.roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );
    entity.position = position;
    entity.orientation = orientation;
    cone.position = conePosition;
    cone.cylinder.length = coordinates.alt;
    cone.cylinder.bottomRadius = coordinates.alt/2;
  }
}
