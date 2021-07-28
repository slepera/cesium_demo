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
import { NgxGaugeType } from "ngx-gauge/gauge/gauge";

interface dataType {
  x: number;
  y: string;
}

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
  public myBoolean = true;
  private tempData: dataType = {
    x: 0,
    y: ''
  };
  private umidData: dataType= {
    x: 0,
    y: ''
  };
  private selectedData: dataType= {
    x: 0,
    y: ''
  };
  public selectedType: string;
  gaugeType: NgxGaugeType = "arch";
  gaugeValue = 28.3;
  gaugeLabel = "Speed";
  gaugeAppendText = "km/hr";
  thresholdConfig = {
    '0': {color: 'green'},
    '40': {color: 'orange'},
    '75.5': {color: 'red'}
};
bcolor = 'white';
  constructor(private dataManager: DataManagerService) {
    this.selectedType = this.dataManager.selectedData;
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
      title: {
        text: 'Average Temperature',
        align: 'left'
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
      title: {
        text: 'Average Humidity',
        align: 'left'
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
//this.dataManager.chartConnect();



this.subscription = dataManager.chartMessages.subscribe(msg => {
    n = +msg.x
    /* if(msg.msg_type === 'cpu')
    {
      this.chartOptions.series = [{
        data: this.chartOptions.series[0].data.concat({
            x: n,
            y: msg.y
          }
        )
      }]
    }else if(msg.msg_type === 'mem')
  {
    this.chartOptions2.series = [{
      data: this.chartOptions2.series[0].data.concat({
          x: n,
          y: msg.y
        }
      )
    }]
  } */
  if(msg.msg_type === 'cpu'){
    this.tempData.x = n;
    this.tempData.y = msg.y;
  }else if  (msg.msg_type === 'mem'){
    this.umidData.x = n;
    this.umidData.y = msg.y;
  }

  if (this.selectedType == 'temp'){
    this.selectedData.x = this.tempData.x;
    this.selectedData.y = this.tempData.y;
  } else if (this.selectedType == 'umidity'){
    this.selectedData.x = this.umidData.x;
    this.selectedData.y = this.umidData.y;
  }
  this.chartOptions.series = [{
    data: this.chartOptions.series[0].data.concat({
        x: this.selectedData.x,
        y: this.selectedData.y
      }
    )
  }]
  this.gaugeValue = +this.selectedData.y;

  });

  }




}
