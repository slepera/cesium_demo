import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { Coord } from '../coord';
import { DataManagerService } from '../data-manager.service';
import { DronesService } from '../drones.service';
import cz from '../Vehicle.json';
import { IconService } from '../icon.service';
import { ThemePalette } from '@angular/material/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SatelliteService } from '../satellite.service';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, ComponentPortal, Portal } from '@angular/cdk/portal';
import { DataChartComponent } from '../data-chart/data-chart.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { GaugeComponent } from '../gauge/gauge.component';
import { UtilityModule } from '../utility/utility.module';

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

  public status = 'NO_SIG';

  private entity;
  public subscription;
  public coord: Coord = {
    lat: 43.318086546037215,
    lon: 13.853051325073828,
    alt: -150,
    heading: 0,
    pitch: 0,
    roll: 0
  }

  private platform;
  private submarine;
  private sar;
  private multi;
  private lidar;
  private sarLayer;
  mViewer: any;
  lastPickedEntity: any;
  public showSar = true;
  public cone;
  public dataCircle;
  private startDate: Date;
  private stopDate: Date;
  public useDefault = false;
  private isWsOpen = false;
  private previous_sub_position;

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
  umidChecked = false;
  tempChecked = false;
  windChecked = false;
  isChecked = false;

  allComplete: boolean = false;
  nextPosition: number = 0;
  chartOverlayRef: OverlayRef;

  @ViewChildren(CdkPortal) templatePortals:
    QueryList<Portal<any>>;
  sub2: any;

  constructor(private dronesService: DronesService, private dataManager: DataManagerService, public dialog: MatDialog,
    private iconService: IconService, private satService: SatelliteService, public overlay: Overlay, public viewContainerRef: ViewContainerRef) {
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
    var myVideo: any = document.getElementById("trailer");
    myVideo.hidden = true;

    var myVideo_submarine: any = document.getElementById("trailer_submarine");
    myVideo_submarine.hidden = true;

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
    //viewer.trackedEntity = this.platform;

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

    this.submarine = viewer.entities.add({
      name: "submarine",
      model: {
        uri: '../../assets/sub2.glb',
        minimumPixelSize: 4,
        maximumScale: 0.05,
        scale: 0.05
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

    this.stopDate.setDate(this.startDate.getDate() + 1)

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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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

    this.startDate.setDate(this.startDate.getDate() + 1)
    this.stopDate.setDate(this.stopDate.getDate() + 1)

    this.sar.entities.add({
      name: "sarImage1",
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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

    this.startDate.setDate(this.startDate.getDate() + 1)
    this.stopDate.setDate(this.stopDate.getDate() + 1)
    this.sar.entities.add({
      name: "sarImage2",
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
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

  playVideoSubmarine() {
    var myVideo: any = document.getElementById("trailer_submarine");
    if (myVideo.paused) myVideo.play();
  }

  pauseVideoSubmarine() {
    var myVideo: any = document.getElementById("trailer_submarine");
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
      if (colorNum < 0.33) {
        colorSel = Cesium.Color.YELLOW.withAlpha(0.5);
      } else if (colorNum < 0.67) {
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
      var sub_position = Cesium.Cartesian3.fromDegrees(this.coord.lon + 0.01, this.coord.lat + 0.01, 50);
      this.submarine.position = sub_position;
      this.submarine.orientation = UtilityModule.Orientation(sub_position, this.previous_sub_position, 90, 180);
      this.previous_sub_position = sub_position;
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

  startSendingSubmarine() {
    this.dataManager.startSending()
    var myVideo: any = document.getElementById("trailer_submarine");
    if (myVideo.paused) myVideo.play();
  }

  stopSendingSubmarine() {
    this.dataManager.stopSending()
    var myVideo: any = document.getElementById("trailer_submarine");
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
    this.mViewer.clock.multiplier = 1;
    this.mViewer.timeline.zoomTo(this.mViewer.clock.startTime, this.mViewer.clock.stopTime);
    this.mViewer.clock.shouldAnimate = true;
  }


  SinmulateOrbitTimeTagged() {
    var entities = this.mViewer.entities;
    var ttPos;
    var ttPosCone;
    var i = 0;
    ttPos = new Cesium.SampledPositionProperty();
    ttPosCone = new Cesium.SampledPositionProperty();
    var ele;
    this.dataManager.getOrbit("ciao").subscribe(val => {
      val['positions'].forEach(element => {
        ttPos.addSample(Cesium.JulianDate.fromDate(new Date(element.time * 1000), new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(element.lon, element.lat, element.ele));
        ttPosCone.addSample(Cesium.JulianDate.fromDate(new Date(element.time * 1000), new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(element.lon, element.lat, element.ele / 2));
      })
      console.log(ttPos);
      ele = val['positions'][0].ele;
      entities.add({
        name: 'SAT-1' + Math.random(),
        position: ttPos,
        billboard: {
          image: 'assets/satellite1-64.png'
        },
        orientation: new Cesium.VelocityOrientationProperty(ttPos),
        path: {
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.RED
          }),
          width: 5,
          trailTime: 10000,
          leadTime: 0
        }
      });

      entities.add({
        position: ttPosCone,
        orientation: new Cesium.VelocityOrientationProperty(ttPosCone),
        cylinder: {
          HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          length: ele,
          topRadius: 0,
          bottomRadius: ele / 10,
          material: Cesium.Color.RED.withAlpha(.4),
          outline: !0,
          numberOfVerticalLines: 0,
          outlineColor: Cesium.Color.RED.withAlpha(.8)
        },
      });
    }

    );


  }

  showImages(ob: MatCheckboxChange) {
    switch (ob.source.id) {
      case 'mat-checkbox-1': {
        if (ob.checked === true) {
          this.sar.show = true;
          //this.sarLayer.show = false;

          this.layer.sublayers.forEach(t => {
            if (t.name !== 'SAR') {
              t.completed = false
            }
          })
          this.lidar.show = false;
          this.multi.show = false;
        } else {
          this.sar.show = false;
          //this.sarLayer.show = true;
        }
        break
      }
      case 'mat-checkbox-2': {
        if (ob.checked === true) {
          this.multi.show = true;
          this.layer.sublayers.forEach(t => {
            if (t.name !== 'MULTI') {
              t.completed = false
            }
          })
          this.lidar.show = false;
          this.sar.show = false;
        } else {
          this.multi.show = false;
        }
        break
      }
      case 'mat-checkbox-3': {
        if (ob.checked === true) {
          this.lidar.show = true;

          this.layer.sublayers.forEach(t => {
            if (t.name !== 'LIDAR') {
              t.completed = false
            }
          })
          this.multi.show = false;
          this.sar.show = false;

        } else {
          this.lidar.show = false;
        }
        break
      }
    }

  }


  public toggle(event: MatSlideToggleChange) {
    console.log('toggle', event.checked);
    if (event.checked) {
      this.dataManager.selectedData = event.source.id;
      if (this.isChecked == true) {
        this.closeChartPanel();
      } else {
        this.startWsChart();
      }
      this.openChart();
      if (event.source.id == 'temp') {
        this.umidChecked = false;
        this.windChecked = false;
        console.log(this.windChecked);
      } else if (event.source.id == 'umidity') {
        this.tempChecked = false;
        this.windChecked = false;
      } else if (event.source.id == 'wind') {
        this.tempChecked = false;
        this.umidChecked = false;
      }
      this.isChecked = true;
    } else {
      this.closeChartPanel();
      this.stopWsChart();
      this.isChecked = false;
    }
  }

  startWsChart() {
    if (!this.isWsOpen) {
      this.dataManager.playChart();
      this.isWsOpen = true;
    }
  }

  goToPlatform() {
    //this.mViewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(this.coord.lon, this.coord.lat, 10000)});
    this.mViewer.zoomTo(this.platform);
  }

  stopWsChart() {
    this.dataManager.stopChart();
    this.isWsOpen = false;

  }

  showGauge() {
    //window.open("http://localhost:4200/gauge/",'window','location=no, toolbar=no, menubar=no, resizable=yes');
    this.startWsChart();
    this.dialog.open(GaugeComponent/* ,{
      height: '400px',
      width: '600px'
    } */);
  }

  public toggleVideo(event: MatSlideToggleChange) {
    var myVideo: any = document.getElementById("trailer");
    if (event.checked) {
      myVideo.hidden = false;
    } else {
      myVideo.hidden = true;
    }
  }

  public toggleVideoSubmarine(event: MatSlideToggleChange) {
    var myVideo: any = document.getElementById("trailer_submarine");
    if (event.checked) {
      myVideo.hidden = false;
    } else {
      myVideo.hidden = true;
    }
  }
  openChart() {
    let config = new OverlayConfig();
    config.positionStrategy = this.overlay.position()
      .global()
      .right(`50px`)
      .top(`50px`);
    this.chartOverlayRef = this.overlay.create(config);
    this.chartOverlayRef.attach(new ComponentPortal(DataChartComponent, this.viewContainerRef));
  }

  closeChartPanel() {
    this.chartOverlayRef.dispose();
  }

  ngOnDestroy() {
    this.dataManager.OnDestroy();
  }
}
