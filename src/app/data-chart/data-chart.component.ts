import { trimTrailingNulls } from "@angular/compiler/src/render3/view/util";
import { Component, ViewChild } from "@angular/core";
import { webSocket } from "rxjs/webSocket";
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { DataManagerService } from "../data-manager.service";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};
let k=10;
let n: number;
@Component({
  selector: 'app-data-chart',
  templateUrl: './data-chart.component.html',
  styleUrls: ['./data-chart.component.css']
})
export class DataChartComponent {

  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public chartOptions;
  public id;
  public subscription;

  constructor(private dataManager: DataManagerService) {
    // WebSocket interno sfruttando rxjs/websocket
    //const subject = webSocket('ws://127.0.0.1:8000/ws/data/');
    /*subject.subscribe(
      msg => {
        console.log('message received: ' + JSON.stringify(msg)); // Called whenever there is a message from the server.
        n = +JSON.parse(JSON.stringify(msg)).key2
        this.chartOptions.series = [{
          data: this.chartOptions.series[0].data.concat({
            x: n,
            y: JSON.parse(JSON.stringify(msg)).key1
          })
        }]
      },
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );*/

    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: []
        }
      ],
      chart: {
        id: 'area-datetime',
        type: 'area',
        height: 350,
        zoom: {
          autoScaleYaxis: true
        }
      },
      annotations: {
        yaxis: [{
          borderColor: '#999',
          label: {
            show: true,
            text: 'Support',
            style: {
              color: "#fff",
              background: '#00E396'
            }
          }
        }],
        xaxis: [{
          borderColor: '#999',
          yAxisIndex: 0,
          label: {
            show: true,
            text: 'Rally',
            style: {
              color: "#fff",
              background: '#775DD0'
            }
          }
        }]
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
        style: 'hollow',
      },
      xaxis: {
        type: 'datetime',
        tickAmount: 6,
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      };

    //this.id = setInterval(() => {
    //  this.updateSeries();
    //}, 3000);
    
// WebSocket usando il servizio websocket.service e data-manager
    this.subscription = dataManager.messages.subscribe(msg => {
      console.log("Data: " + msg.lat);
      console.log("Time: " + msg.lon);
      n = +msg.lat
      this.chartOptions.series = [{
        data: this.chartOptions.series[0].data.concat({
          x: n,
          y: msg.lon
        }
        )
      }]
    });

  }

  // Questo metodo per utilizzare le chiamate http con il backend 'mysite'
  public updateSeries() {
    let n: number;
    this.dataManager.getData().subscribe((data: string[]) => {
      n = +data['key2']
      this.chartOptions.series = [{
        data: this.chartOptions.series[0].data.concat({
          x: n,
          y: data['key1']
        }
        )
      }]
    }
    );
  }


}
