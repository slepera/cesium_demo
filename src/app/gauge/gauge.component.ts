import { Component, Injectable, OnInit } from '@angular/core';
import { NgxGaugeType } from 'ngx-gauge/gauge/gauge';
import { DataManagerService } from '../data-manager.service';

let n: number;

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent {
  subscription: any;
  gaugeType: NgxGaugeType = "arch";
  size=120;
  thresholdConfig = {
    '0': {color: 'green'},
    '40': {color: 'orange'},
    '75.5': {color: 'red'}
};

  thresholdConfigPh = {
    '0': {color: 'red'},
    '3': {color: 'orange'},
    '5': {color: 'green'},
    '9': {color: 'blue'},
    '11': {color: 'purple'}
  };
  thresholdConfigTemp = {
    '0': {color: 'green'},
    '25': {color: 'yellow'},
    '35': {color: 'orange'},
    '40': {color: 'red'}
  };

  tempValue = 0;
  tempLabel = "Temp";
  tempAppendText = "°C";

  umidValue = 0;
  umidLabel = "Umidity";
  umidAppendText = "%";

  windValue = 0;
  windLabel = "Wind speed";
  windAppendText = "km/h";

  salValue = 0;
  salLabel = "Salinity";
  salAppendText = "%";

  phValue = 0;
  phLabel = "pH";
  phAppendText = "";

  constructor(private dataManager: DataManagerService) {
    this.subscription = dataManager.chartMessages.subscribe(msg => /* console.log("gauge: "+msg) */{
    n = +msg.y
    if(msg.msg_type === 'cpu')
    {
      this.tempValue = n/100*50;
      this.windValue=n;
      this.phValue=n/100*14;
    }

  if(msg.msg_type === 'mem')
  {
    this.umidValue = n;
    this.salValue = this.umidValue;
  }

   });
  }

  

}
