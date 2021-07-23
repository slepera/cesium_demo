import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';

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
  public orbitEndPoint: string = 'http://localhost:8080/orbit/';
  public chartMessages: Subject<ChartMessage>;
  public droneMessages: Subject<DroneMessage>;

  constructor(private http: HttpClient, private chartWsService: WebsocketService, private droneWsService: WebsocketService) {
  }
  droneConnect(){
    this.droneMessages = <Subject<DroneMessage>>this.droneWsService.connect(SOCKET_DRONE_URL).pipe(map(
      (response: MessageEvent): DroneMessage => {
        let data = JSON.parse(response.data);
        return {
          lat: data.drone_msg.lat,
          lon: data.drone_msg.lon,
          alt: data.drone_msg.alt,
          time: data.drone_msg.time
        };
      }
    ));
  }

  chartConnect(){
    this.chartMessages = <Subject<ChartMessage>>this.chartWsService.connect(SOCKET_CHART_URL).pipe(map(
      (response: MessageEvent): ChartMessage => {
        let data = JSON.parse(response.data);
        console.log(data);
        return {
          msg_type: data.chart_msg.msg_type,
          x: data.chart_msg.x,
          y: data.chart_msg.y
        };
      }
    ));
  }


  // GET request
  getVideo(){
    return this.http.get(this.videoEndpoint);
  }

  getOrbit(id: string){
    return this.http.get(this.orbitEndPoint + id);
  }

  //Data receiving from WebSocket: start and stop methods
  startSending(){
    this.droneWsService.send('start');
  }

  stopSending(){
    this.droneWsService.send('stop');
  }

  closeConnection(){
    this.droneWsService.close();
  }
}

