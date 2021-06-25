import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Cartesian3, ShadowMode } from 'cesium';
import { Coord } from '../coord';
import { DataManagerService } from '../data-manager.service';
import { DronesService } from '../drones.service';
import cz from '../Vehicle.json';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { IconService } from '../icon.service';

@Component({
  selector: 'app-monitor-control',
  templateUrl: './monitor-control.component.html',
  styleUrls: ['./monitor-control.component.css']
})
export class MonitorControlComponent implements OnInit {
  private entity;
  public subscription;
  public coord: Coord = {
    lat: 10,
    lon: 44.0503706,
    alt:10,
    heading: 0,
    pitch: 0,
    roll: 0
  }
  private platform;
  private sar;
  mViewer: any;
  lastPickedEntity: any;
  private property;
  private property_2;

  constructor( private dronesService: DronesService, private dataManager: DataManagerService, 
    private _snackBar: MatSnackBar, private iconService: IconService ) { 
    this.property = new Cesium.SampledPositionProperty();
    this.property_2 = new Cesium.SampledPositionProperty();
    this.iconService.registerIcons();
  }

  ngOnInit(): void {
    const viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain(),
      infoBox: false,
      selectionIndicator: false,
      //shadows: true,
      shouldAnimate: true,
      animation: true,
      timeline: true
    });
    const scene = viewer.scene;
    scene.skyAtmosphere.show = true;
    scene.fog.enabled = false;
    scene.globe.showGroundAtmosphere = false;
    
    
    this.mViewer = viewer;

    if (!scene.pickPositionSupported) {
      window.alert('This browser does not support pickPosition.');
    }
    var handler;
    var _this = this;
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
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
          _this.openSnackBar(pickedObject.id.name);
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
    this.AddEquatorial();
    this.AddPolar();
    this.TimeSet();

    // Click event to get coordinates
    scene.canvas.addEventListener('contextmenu', (event) => {

      event.preventDefault();
      
      const mousePosition = new Cesium.Cartesian2(event.clientX, event.clientY);
      
      const selectedLocation = convertScreenPixelToLocation(mousePosition );
      
      setMarkerInPos(selectedLocation);
      
      }, false);
      function convertScreenPixelToLocation(mousePosition) {
      
      const ellipsoid = viewer.scene.globe.ellipsoid;
      
      const cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
      
      if (cartesian) {
      
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      
      const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(15);
      
      const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(15);
      
      return {lat: Number(latitudeString),lng: Number(longitudeString)};
      
      } else {
      
      return null;
      
      }
      
      }
      function setMarkerInPos(position){
      
      viewer.pickTranslucentDepth = true;
      
      const locationMarker = viewer.entities.add({
      
      name : 'location',
      
      position : Cesium.Cartesian3.fromDegrees(position.lng, position.lat, 300),
      
      point : {
      
      pixelSize : 5,
      
      color : Cesium.Color.RED,
      
      outlineColor : Cesium.Color.WHITE,
      
      outlineWidth : 2
      
      },
      
      label : {
      
      text : ""+position.lng+','+position.lat,
      
      font : '14pt monospace',
      
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      
      outlineWidth : 2,
      
      verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
      
      pixelOffset : new Cesium.Cartesian2(0, -9)
      
      }
      
      });
      
      }
    
    //Display a continuous orbit
    //viewer.dataSources.add(Cesium.CzmlDataSource.load(cz));
    



    //Platform
    this.platform = this.mViewer.entities.add({
      name: "platform",
      model:{
        uri: "../../assets/PlatformBlack.glb",
        scale: 0.5,
        minimumPixelSize: 128,
        maximumScale: 1,
        color: Cesium.Color.ORANGERED,
        colorBlendMode: Cesium.ColorBlendMode.MIX,
        colorBlendAmount: 0.3
      }
    });
    this.platform.position = new  Cesium.Cartesian3.fromDegrees(
      13.853051325073828,
      43.318086546037215, 
      -150
    );
    viewer.trackedEntity = this.platform;

    //Sar image
    this.sar = viewer.entities.add({
      name: "sarImage",
      polygon : {
        hierarchy : Cesium.Cartesian3.fromDegreesArray([
                                  13.756, 43.297086546037215,
                                  13.856791325073828, 43.3211846037215,
                                  13.909051325073828, 43.253086546037215,
                                  13.803051325073828, 43.218086546037215,
                                  ]),
        height : 50,
        material : "../../assets/SarImage.png",
        }
    })
    
    //Drone
    this.entity = viewer.entities.add({
      name: "drone",
      model:{
        uri: "../../assets/CesiumDrone.glb",
        minimumPixelSize: 128,
        maximumScale: 50,
        scale: 50
      }
    });

  }

  webSocketConnect(){
     //Update drone position from websocket data
     this.dataManager.connect();
     this.subscription = this.dataManager.messages.subscribe(msg => {
      this.coord.lat = +msg.lat;
      this.coord.lon = +msg.lon;
      this.coord.alt = +msg.alt;
      this.coord.heading = 0;
      this.coord.pitch = 0;
      this.coord.roll = 0;
      this.dronesService.updatePosition(this.entity, this.coord);
    });
  }
  startSending(){
    this.dataManager.startSending()
  }

  stopSending(){
    this.dataManager.stopSending()
  }

  closeConnection(){
    this.dataManager.closeConnection()
  }


  TimeSet() {
    var currentTime = new Cesium.JulianDate;
    var startTime = new Cesium.JulianDate;
    var endTime = new Cesium.JulianDate;
    Cesium.JulianDate.now(currentTime);
    Cesium.JulianDate.addDays(currentTime, -30, startTime);
    Cesium.JulianDate.addDays(currentTime, 30, endTime);
    var clock = new Cesium.Clock({
      startTime: startTime,
      currentTime: currentTime,
      stopTime: endTime,
      clockRange: Cesium.ClockRange.LOOP_STOP
    });
    this.mViewer.clock.startTime = clock.startTime;
    this.mViewer.clock.stopTime = clock.stopTime;
    this.mViewer.clock.currentTime = clock.currentTime;
    this.mViewer.clock.clockRange = clock.clockRange;
    this.mViewer.clock.multiplier = 10 * 10;
    this.mViewer.timeline.zoomTo(this.mViewer.clock.startTime, this.mViewer.clock.stopTime);
    this.mViewer.clock.shouldAnimate = true;
  }
  
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  CalculatePositionSamples(point, endPoint, startTime, duration, intervalCount) {

    var deltaStep = duration / (intervalCount > 0 ? intervalCount : 1);

    var delta = {
      lon: (endPoint.lon - point.lon) / intervalCount,
      lat: (endPoint.lat - point.lat) / intervalCount
    };

    for (var since = 0; since <= duration; since += deltaStep) {
      this.property.addSample(
        Cesium.JulianDate.addSeconds(startTime, since, new Cesium.JulianDate()),
        Cesium.Cartesian3.fromDegrees(point.lon += delta.lon, point.lat += delta.lat, 100000.0)
      );
      this.property_2.addSample(
        Cesium.JulianDate.addSeconds(startTime, since, new Cesium.JulianDate()),
        Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 50000.0)
      );
    }
    return;
  }

  SinmulateOrbitTimeTagged() {
    var entities = this.mViewer.entities;

    var duration = 10000;
    var frequency = 100;

    var start = Cesium.JulianDate.fromDate(new Date());

    var point = {
      lat: -75.0,
      lon: 12.0
    };
    var finalPoint = {
      lat: +90.0,
      lon: 12.0
    };



    this.CalculatePositionSamples(point, finalPoint, start, duration, frequency);

    var target = entities.add({
      name: 'SAT-1' + Math.random(),
      position: this.property,
      billboard: {
        image: 'assets/satellite1-64.png'
      },
      orientation: new Cesium.VelocityOrientationProperty(this.property),
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.RED
        }),
        width: 5,
        trailTime: duration,
        leadTime: 0
      }
    });

    entities.add({
      position: this.property_2,
      orientation: new Cesium.VelocityOrientationProperty(this.property_2),
      cylinder: {
        HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        length: 100000,
        topRadius: 0,
        bottomRadius: 100000 / 2,
        material: Cesium.Color.RED.withAlpha(.4),
        outline: !0,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.RED.withAlpha(.8)
      },
    });
  }


  AddPolar() {
    var positions_polar: Array<Cartesian3> = new Array<Cartesian3>();
    for (let i = 0; i < 360; i++) {
      positions_polar.push(Cesium.Cartesian3.fromDegrees(i, 0, 1000000));
    }
    this.mViewer.entities.add({
      polyline: {
        positions: positions_polar
      }
    });
  }

  AddEquatorial() {
    var positions_equatorial: Array<Cartesian3> = new Array<Cartesian3>();
    for (let i = 0; i < 360; i++) {
      positions_equatorial.push(Cesium.Cartesian3.fromDegrees(0, i, 1000000));
    }
    this.mViewer.entities.add({
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

  async SinmulateOrbit() {

    var satellite = this.mViewer.entities.add({
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
}
