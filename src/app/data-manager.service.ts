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
  x: string;
  y: string;
}

const SOCKET_CHART_URL = 'ws://localhost:8080/chart_web_socket';
const SOCKET_DRONE_URL = 'ws://localhost:8080/drone_web_socket';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  public restApiEndpoint: string = 'http://127.0.0.1:8000/polls/';
  public chartMessages: Subject<ChartMessage>;
  public droneMessages: Subject<DroneMessage>;

  constructor(private http: HttpClient, private chartWsService: WebsocketService, private droneWsService: WebsocketService) {     
  }
  droneConnect(){
    this.droneMessages = <Subject<DroneMessage>>this.droneWsService.connect(SOCKET_DRONE_URL).pipe(map(
      (response: MessageEvent): DroneMessage => {
        let data = JSON.parse(response.data);
        return {
          lat: data.lat,
          lon: data.lon,
          alt: data.alt,
          time: data.time
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
          x: data.chart_msg.x,
          y: data.chart_msg.y
        };
      }
    ));
  }


  // GET request
  getData(){
    return this.http.get(this.restApiEndpoint);
  }

  //Data receiving from WebSocket: start and stop methods
  startSending(){
    this.droneWsService.send('Start');
  }
  
  stopSending(){
    this.droneWsService.send('Stop');
  }

  closeConnection(){
    this.droneWsService.close();
  }
}

