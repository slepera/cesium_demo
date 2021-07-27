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
export class GaugeComponent implements OnInit {
  subscription: any;
  gaugeType: NgxGaugeType = "arch";
  gaugeValue = 28.3;
  gaugeLabel = "Speed";
  gaugeAppendText = "km/hr";
  thresholdConfig = {
    '0': {color: 'green'},
    '40': {color: 'orange'},
    '75.5': {color: 'red'}
};

  gaugeType2: NgxGaugeType = "arch";
  gaugeValue2 = 10;
  gaugeLabel2 = "Speed";
  gaugeAppendText2 = "km/hr";

  constructor(private dataManager: DataManagerService) {
    //this.dataManager.chartConnect();
    this.subscription = dataManager.chartMessages.subscribe(msg => /* console.log("gauge: "+msg) */{
    // console.log("Msg_Type: " + msg.msg_type);
    // console.log("Data: " + msg.y);
    // console.log("Time: " + msg.x);
    n = +msg.y
    if(msg.msg_type === 'cpu')
    {
      this.gaugeValue = n;
    }

  if(msg.msg_type === 'mem')
  {
    this.gaugeValue2 = n;
  }

   });
  }

  updateData(msg){
    console.log("Msg_Type: " + msg.msg_type);
    console.log("Data: " + msg.y);
    console.log("Time: " + msg.x);
    n = +msg.y
    if(msg.msg_type === 'cpu')
    {
      this.gaugeValue = n;
    }

  if(msg.msg_type === 'mem')
  {
    this.gaugeValue2 = n;
  }

  }  
  ngOnInit(): void {
    
  }

  

}
