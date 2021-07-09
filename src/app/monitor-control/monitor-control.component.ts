import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Coord } from '../coord';
import { DataManagerService } from '../data-manager.service';
import { DronesService } from '../drones.service';
import cz from '../Vehicle.json';
import { IconService } from '../icon.service';
import { ThemePalette } from '@angular/material/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SatelliteService } from '../satellite.service';

export interface Layer {
  name: string;
  completed: boolean;
  color: ThemePalette;
  sublayers?: Layer[];
}

@Component({
  selector: 'app-monitor-control',
  templateUrl: './monitor-control.component.html',
  styleUrls: ['./monitor-control.component.css']
})
export class MonitorControlComponent implements OnInit {
  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;
  isPlay: boolean = false;


  private entity;
  public subscription;
  public coord: Coord = {
    lat: 44.0503706,
    lon: 10,
    alt: 10,
    heading: 0,
    pitch: 0,
    roll: 0
  }
  private platform;
  private sar;
  private multi;
  private lidar;
  private sarLayer;
  mViewer: any;
  lastPickedEntity: any;
  private property;
  private property_2;
  public showSar = true;
  public cone;
  public dataCircle;
  private startDate: Date;
  private stopDate: Date;

  layer: Layer = {
    name: 'Layers',
    completed: false,
    color: 'primary',
    sublayers: [
      { name: 'SAR', completed: false, color: 'primary' },
      { name: 'MULTI', completed: false, color: 'accent' },
      { name: 'LIDAR', completed: false, color: 'warn' }
    ]
  };

  allComplete: boolean = false;

  constructor(private dronesService: DronesService, private dataManager: DataManagerService,
    private iconService: IconService, private satService: SatelliteService) {
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
    this.mViewer = viewer;
    const scene = this.mViewer.scene;
    scene.skyAtmosphere.show = true;
    scene.fog.enabled = false;
    scene.globe.showGroundAtmosphere = false;
    const lat1 = 43.326;
    const lon1 = 13.793;
    const lat2 = 43.354;
    const lon2 = 13.871;
    const lat3 = 43.306;
    const lon3 = 13.90;
    const lat4 = 43.275;
    const lon4 = 13.819;

    if (!scene.pickPositionSupported) {
      window.alert('This browser does not support pickPosition.');
    }
    var handler;
    var _this = this;
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    this.satService.handleSatellite(scene, _this, handler);
    this.satService.AddEquatorial(this.mViewer);
    this.satService.AddPolar(this.mViewer);
    this.TimeSet();

    // Click event to get coordinates
    // scene.canvas.addEventListener('contextmenu', (event) => {

    //   event.preventDefault();

    //   const mousePosition = new Cesium.Cartesian2(event.clientX, event.clientY);

    //   const selectedLocation = convertScreenPixelToLocation(mousePosition);

    //   setMarkerInPos(selectedLocation);

    // }, false);
    // function convertScreenPixelToLocation(mousePosition) {

    //   const ellipsoid = viewer.scene.globe.ellipsoid;

    //   const cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);

    //   if (cartesian) {

    //     const cartographic = ellipsoid.cartesianToCartographic(cartesian);

    //     const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(15);

    //     const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(15);

    //     return { lat: Number(latitudeString), lng: Number(longitudeString) };

    //   } else {

    //     return null;

    //   }

    // }
    // function setMarkerInPos(position) {

    //   viewer.pickTranslucentDepth = true;

    //   const locationMarker = viewer.entities.add({

    //     name: 'location',

    //     position: Cesium.Cartesian3.fromDegrees(position.lng, position.lat, 300),

    //     point: {

    //       pixelSize: 5,

    //       color: Cesium.Color.RED,

    //       outlineColor: Cesium.Color.WHITE,

    //       outlineWidth: 2

    //     },

    //     label: {

    //       text: "" + position.lng + ',' + position.lat,

    //       font: '14pt monospace',

    //       style: Cesium.LabelStyle.FILL_AND_OUTLINE,

    //       outlineWidth: 2,

    //       verticalOrigin: Cesium.VerticalOrigin.BOTTOM,

    //       pixelOffset: new Cesium.Cartesian2(0, -9)

    //     }

    //   });

    // }

    //Display a continuous orbit
    //viewer.dataSources.add(Cesium.CzmlDataSource.load(cz));

    //Platform
    this.platform = this.mViewer.entities.add({
      name: "platform",
      model: {
        uri: "../../assets/PlatformBlack.glb",
        scale: 0.5,
        minimumPixelSize: 128,
        maximumScale: 1,
        color: Cesium.Color.ORANGERED,
        colorBlendMode: Cesium.ColorBlendMode.MIX,
        colorBlendAmount: 0.3
      }
    });
    this.platform.position = new Cesium.Cartesian3.fromDegrees(
      13.853051325073828,
      43.318086546037215,
      -150
    );
    viewer.trackedEntity = this.platform;

    //Drone
    this.entity = viewer.entities.add({
      name: "drone",
      model: {
        uri: "../../assets/CesiumDrone.glb",
        minimumPixelSize: 128,
        maximumScale: 50,
        scale: 50
      }
    });

    this.cone = viewer.entities.add({
      name: "cone",
      cylinder: {
        HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        length: 100,
        topRadius: 0,
        bottomRadius: 200,
        material: Cesium.Color.BLUEVIOLET.withAlpha(.4),
        outline: !0,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.RED.withAlpha(.8)
      },
      show: true
    });


    this.sar = new Cesium.CustomDataSource('sar');
    this.multi = new Cesium.CustomDataSource('multi');
    this.lidar = new Cesium.CustomDataSource('lidar');
    this.mViewer.dataSources.add(this.sar);
    this.mViewer.dataSources.add(this.multi);
    this.mViewer.dataSources.add(this.lidar);
    this.sar.show = false;
    this.multi.show = false;
    this.lidar.show = false;

    this.startDate = new Date();
    this.stopDate = new Date();

    this.stopDate.setDate( this.startDate.getDate() + 1 )

    /* var imageryLayers = this.mViewer.imageryLayers;
    this.sarLayer = imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      url: "../../assets/SarImage.png",
      rectangle: Cesium.Rectangle.fromDegrees(
        13.82,
        43.29,
        13.88,
        43.34
      ),
    }));
    this.sarLayer.alpha = Cesium.defaultValue(0.5, 0.5);
    this.sarLayer.show = Cesium.defaultValue(this.showSar, true);
    this.sarLayer.show = true; */

    this.sar.entities.add({
      name: "sarImage",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: new Cesium.ImageMaterialProperty({
          image: "../../assets/SarImage.png",
          alpha: 0.5,
      })
      },
    })

    this.multi.entities.add({
      name: "seaImage",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/offshore-oil.jpg",
      },
    })

    this.lidar.entities.add({
      name: "oilImage",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/SeaImagery.jpeg",
      },
    })

    this.startDate.setDate( this.startDate.getDate() + 1 )
    this.stopDate.setDate( this.stopDate.getDate() + 1 )

    this.sar.entities.add({
      name: "sarImage1",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: new Cesium.ImageMaterialProperty({
          image: "../../assets/SarImage_DAY1.png",
          alpha: 0.5,
      })
      },
    })

    this.multi.entities.add({
      name: "seaImage1",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/offshore-oil_DAY1.jpg",
      },
    })

    this.lidar.entities.add({
      name: "oilImage1",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/SeaImagery_DAY1.jpeg",
      },
    })

    this.startDate.setDate( this.startDate.getDate() + 1 )
    this.stopDate.setDate( this.stopDate.getDate() + 1 )
    this.sar.entities.add({
      name: "sarImage2",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: new Cesium.ImageMaterialProperty({
          image: "../../assets/SarImage_DAY2.png",
          alpha: 0.5,
      })
      },
    })

    this.multi.entities.add({
      name: "seaImage2",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/offshore-oil_DAY2.jpg",
      },
    })

    this.lidar.entities.add({
      name: "oilImage2",
      availability: new Cesium.TimeIntervalCollection( [new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(this.startDate),
        stop: Cesium.JulianDate.fromDate(this.stopDate)
      })]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          lon1, lat1,
          lon2, lat2,
          lon3, lat3,
          lon4, lat4
        ]),
        height: 50,
        material: "../../assets/SeaImagery_DAY2.jpg",
      },
    })
  }


  playVideo() {
    var myVideo: any = document.getElementById("trailer");
    if (myVideo.paused) myVideo.play();
  }

  pauseVideo() {
    var myVideo: any = document.getElementById("trailer");
    if (myVideo.played) myVideo.pause();
  }

  webSocketConnect() {
    //Update drone position from websocket data
    this.dataManager.droneConnect();
    this.subscription = this.dataManager.droneMessages.subscribe(msg => {
      this.coord.lat = +msg.lat;
      this.coord.lon = +msg.lon;
      this.coord.alt = +msg.alt;
      this.coord.heading = 0;
      this.coord.pitch = 0;
      this.coord.roll = 0;
      var colorNum = Math.random();
      var colorSel;
      if (colorNum<0.33){
        colorSel = Cesium.Color.YELLOW.withAlpha(0.5);
      } else if (colorNum<0.67){
        colorSel = Cesium.Color.ORANGE.withAlpha(0.5);
      } else {
        colorSel = Cesium.Color.RED.withAlpha(0.5);
      }
      var dataCircle = this.mViewer.entities.add({
        name: "Red ellipse on surface",
        ellipse: {
          semiMinorAxis: 200.0,
          semiMajorAxis: 200.0,
          height: 70,
          material: colorSel,
        },
      });
      this.dronesService.updatePosition(this.entity, this.cone, dataCircle, this.coord);
    });
  }
  startSending() {
    this.dataManager.startSending()
    var myVideo: any = document.getElementById("trailer");
    if (myVideo.paused) myVideo.play();
  }

  stopSending() {
    this.dataManager.stopSending()
    var myVideo: any = document.getElementById("trailer");
    if (myVideo.played) myVideo.pause();
  }

  closeConnection() {
    this.dataManager.closeConnection()
  }


  TimeSet() {
    var currentTime = new Cesium.JulianDate;
    var startTime = new Cesium.JulianDate;
    var endTime = new Cesium.JulianDate;
    Cesium.JulianDate.now(currentTime);
    Cesium.JulianDate.addDays(currentTime, -15, startTime);
    Cesium.JulianDate.addDays(currentTime, 15, endTime);
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
      lat: -35.0,
      lon: 14.0
    };
    var finalPoint = {
      lat: +75.0,
      lon: 14.0
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
        bottomRadius: 50000 / 2,
        material: Cesium.Color.RED.withAlpha(.4),
        outline: !0,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.RED.withAlpha(.8)
      },
    });
  }

  async SinmulateOrbit() {
    this.satService.simulateOrbit(this.mViewer);
  }

  showImages(ob: MatCheckboxChange){
  switch(ob.source.id){
    case 'mat-checkbox-2':{
      if(ob.checked === true){
        this.sar.show = true;
        //this.sarLayer.show = false;

        this.layer.sublayers.forEach(t => {
          if (t.name !== 'SAR'){
            t.completed = false
          }
        } )
        this.lidar.show = false;
        this.multi.show = false;
      }else{
        this.sar.show = false;
        //this.sarLayer.show = true;
      }
      break
    }
    case 'mat-checkbox-3':{
      if(ob.checked === true){
        this.multi.show = true;
        this.layer.sublayers.forEach(t => {
          if (t.name !== 'MULTI'){
            t.completed = false
          }
        } )
        this.lidar.show = false;
        this.sar.show = false;
      }else{
        this.multi.show = false;
      }
      break
    }
    case 'mat-checkbox-4':{
      if(ob.checked === true){
        this.lidar.show = true;

        this.layer.sublayers.forEach(t => {
          if (t.name !== 'LIDAR'){
            t.completed = false
          }
        } )
        this.multi.show = false;
        this.sar.show = false;

      }else{
        this.lidar.show = false;
      }
      break
    }
  }

  }

  updateAllComplete() {
    this.allComplete = this.layer.sublayers != null && this.layer.sublayers.every(t => t.completed);
    console.log("updateAllComplete");
  }

  someComplete(): boolean {
    if (this.layer.sublayers == null) {
      return false;
    }
    return this.layer.sublayers.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.layer.sublayers == null) {
      return;
    }
    this.layer.sublayers.forEach(t => t.completed = completed);
  }
}
