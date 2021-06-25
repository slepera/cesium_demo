import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { Observable } from "rxjs";

@Injectable()
export class WebsocketService {
  constructor() {}

  private subject: Rx.Subject<MessageEvent>;
  private ws;
  
  public connect(url): Rx.Subject<MessageEvent> {
    this.subject = this.create(url);
    console.log("Successfully connected: " + url);
    
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    this.ws = new WebSocket(url);

    let observable = new Observable((obs: Rx.Observer<MessageEvent>) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      return this.ws.close.bind(this.ws);
    });
    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  public send(data: String){
    this.ws.send(data);
  }

  public close(){
    console.log("Disconnected.")
    this.ws.close();
  }
}
