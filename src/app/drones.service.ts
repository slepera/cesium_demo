import { Injectable } from '@angular/core';
import { Coord } from './coord';

@Injectable({
  providedIn: 'root'
})
export class DronesService {

  constructor() { }

  updatePosition(entity, coordinates: Coord){
    var position = new  Cesium.Cartesian3.fromDegrees(
      coordinates.lat,
      coordinates.lon,
      coordinates.alt
    );
    var hpr = new Cesium.HeadingPitchRoll(coordinates.heading, coordinates.pitch, coordinates.roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );
    entity.position = position;
    entity.orientation = orientation;
  }
}
