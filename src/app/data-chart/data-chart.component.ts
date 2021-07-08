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
  public chartOptions2;
  public id;
  public subscription;

  constructor(private dataManager: DataManagerService) {

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
      },

      tooltip: {
        x: {
          format: 'dd MM yyyy'
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
      datetimeUTC: true
      };


    this.chartOptions2 = {
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
      },

      tooltip: {
        x: {
          format: 'dd MM yyyy'
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
      datetimeUTC: true
    };


// WebSocket usando il servizio websocket.service e data-manager
this.dataManager.chartConnect();
this.subscription = dataManager.chartMessages.subscribe(msg => {
    console.log("Msg_Type: " + msg.msg_type);
    console.log("Data: " + msg.y);
    console.log("Time: " + msg.x);
    n = +msg.x
    if(msg.msg_type === 'cpu')
    {
      this.chartOptions.series = [{
        data: this.chartOptions.series[0].data.concat({
            x: n,
            y: msg.y
          }
        )
      }]
    }

  if(msg.msg_type === 'mem')
  {
    this.chartOptions2.series = [{
      data: this.chartOptions2.series[0].data.concat({
          x: n,
          y: msg.y
        }
      )
    }]
  }

  });

  }


}
