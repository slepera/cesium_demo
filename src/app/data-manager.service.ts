import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';

export interface Message {
  lat: string;
  lon: string;
  alt: string;
}

const SOCKET_URL = 'ws://127.0.0.1:8000/ws/data/';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  public restApiEndpoint: string = 'http://127.0.0.1:8000/polls/';
  public messages: Subject<Message>;

  constructor(private http: HttpClient, private wsService: WebsocketService) {     
  }
  connect(){
    this.messages = <Subject<Message>>this.wsService.connect(SOCKET_URL).pipe(map(
      (response: MessageEvent): Message => {
        let data = JSON.parse(response.data);
        return {
          lon: data.key1,
          lat: data.key2,
          alt: data.key3
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
    this.wsService.send('Start');
  }
  
  stopSending(){
    this.wsService.send('Stop');
  }

  closeConnection(){
    this.wsService.close();
  }
}
