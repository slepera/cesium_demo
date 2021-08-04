import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { WebsocketChartService } from './websocket-chart.service';

export interface DroneMessage {
  lat: string;
  lon: string;
  alt: string;
  time: string
}

export interface ChartMessage {
  msg_type: string;
  x: string;
  y: string;
}

const SOCKET_CHART_URL = 'ws://localhost:8080/chart_web_socket';
const SOCKET_DRONE_URL = 'ws://localhost:8080/drone_web_socket';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  public videoEndpoint: string = 'http://localhost:8080/video';
  public videoSubmarineEndpoint: string = 'http://localhost:8080/video_submarine';

  public orbitEndPoint: string = 'http://localhost:8080/orbit/';
  public chartMessages: Subject<ChartMessage>;
  public droneMessages: Subject<DroneMessage>;
  private cM: Subject<ChartMessage>;
  subsc: any;
  public selectedData: string;

  constructor(private http: HttpClient, private chartWsService: WebsocketChartService, private droneWsService: WebsocketService, /* private gaugeComponent: GaugeComponent */) {
    this.cM = new Subject<ChartMessage>();
    this.chartMessages = new Subject<ChartMessage>();
    this.chartConnect();
  }
  droneConnect() {
    this.droneMessages = <Subject<DroneMessage>>this.droneWsService.connect(SOCKET_DRONE_URL).pipe(map(
      (response_drone: MessageEvent): DroneMessage => {
        let data = JSON.parse(response_drone.data);
        return {
          lat: data.drone_msg.lat,
          lon: data.drone_msg.lon,
          alt: data.drone_msg.alt,
          time: data.drone_msg.time
        };
      }
    ));
    console.log(this.chartWsService);
  }

  chartConnect() {
    console.log("Chart Connect");
    // this.chartMessages = <Subject<ChartMessage>>this.chartWsService.connect(SOCKET_CHART_URL).pipe(map(
    //   (response: MessageEvent): ChartMessage => {
    //     let data = JSON.parse(response.data);
    //     console.log(data);
    //     //this.gaugeComponent.updateData(data.chart_msg);

    //     return {
    //       msg_type: data.chart_msg.msg_type,
    //       x: data.chart_msg.x,
    //       y: data.chart_msg.y
    //     };
    //   }
    // ));

    this.cM = <Subject<ChartMessage>>this.chartWsService.connect(SOCKET_CHART_URL).pipe(map(
      (response: MessageEvent): ChartMessage => {
        let data = JSON.parse(response.data);
        //console.log(data);
        //this.gaugeComponent.updateData(data.chart_msg);

        return {
          msg_type: data.chart_msg.msg_type,
          x: data.chart_msg.x,
          y: data.chart_msg.y
        };
      }
    ));

    this.cM.subscribe(msg => this.trigger(msg));
    console.log(this.chartWsService);

  }

  trigger(something) {
    this.chartMessages.next(something);
  }



  // GET request
  getVideo() {
    return this.http.get(this.videoEndpoint);
  }

  getVideoSubmarine() {
    return this.http.get(this.videoSubmarineEndpoint);
  }

  getOrbit(id: string) {
    return this.http.get(this.orbitEndPoint + id);
  }

  //Data receiving from WebSocket: start and stop methods
  startSending() {
    this.droneWsService.send('start');
  }

  stopSending() {
    this.droneWsService.send('stop');
  }

  playChart() {
    this.chartWsService.send('start');
  }

  stopChart() {
    this.chartWsService.send('stop');
  }

  closeConnection() {
    this.droneWsService.close();
  }

  OnDestroy() {
    this.chartWsService.close();
  }
}

