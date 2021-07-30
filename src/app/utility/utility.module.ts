import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class UtilityModule {
  public static Orientation(current, previous, p) {
    var orientation;
    if (previous != undefined) {
      var direction = Cesium.Cartesian3.subtract(current, previous, new Cesium.Cartesian3());
      if (Cesium.Cartesian3.distance(direction, new Cesium.Cartesian3(0, 0, 0)) != 0) {
        Cesium.Cartesian3.normalize(direction, direction);
        var rotationMatrix = Cesium.Transforms.rotationMatrixFromPositionVelocity(previous, direction);
        var rot90 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(p));
        Cesium.Matrix3.multiply(rotationMatrix, rot90, rotationMatrix);
        orientation = Cesium.Quaternion.fromRotationMatrix(rotationMatrix);
      }
      else {
        orientation = Cesium.Transforms.headingPitchRollQuaternion(current, new Cesium.HeadingPitchRoll(0, Cesium.Math.toRadians(p), 0));
      }
    }
    return orientation;
  }
}
