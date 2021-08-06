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
let k = 10;
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
  private chartName: string;
  private selectedData: dataType = {
    x: 0,
    y: ''
  };
  public selectedType: string;
  public gaugeLabel;
  public gaugeAppendText;
  public min = 0;
  public max = 100;
  gaugeType: NgxGaugeType = "arch";
  gaugeValue = 0;
  thresholdConfig;
  thresholdList = {
    'air_temperature':  {
      '0': {color: 'blue'},
      '25': {color: 'green'},
      '35': {color: 'yellow'},
      '40': {color: 'red'}
    },
    'air_humidity': {
      '0': {color: 'blue'},
      '55': {color: 'green'},
      '65': {color: 'yellow'},
      '75.5': {color: 'red'}
  },
    'air_wind':  {
      '0': { color: 'green' },
      '12': { color: 'yellow' },
      '17': { color: 'red' }
    },
    'water_temperature':  {
      '0': {color: 'green'},
      '17': {color: 'yellow'},
      '20': {color: 'orange'},
      '23': {color: 'red'}
    },
    'water_salinity':  {
      '3.4': { color: 'green' },
      '3.5': { color: 'orange' },
      '3.6': { color: 'red' }
    },
    'water_ph':  {
      '0': {color: 'red'},
      '3': {color: 'orange'},
      '5': {color: 'green'},
      '9': {color: 'blue'},
      '11': {color: 'purple'}
    }
  }
  bcolor = 'white';
  constructor(private dataManager: DataManagerService) {
    this.selectedType = this.dataManager.selectedData;
    this.thresholdConfig = this.thresholdList[this.selectedType];
    if (this.selectedType == 'air_temperature') {
        this.chartName = 'Average Temperature';
        this.gaugeLabel = "Temperature";
        this.gaugeAppendText = "°C";
        this.min = 20;
        this.max = 40;
      } else if (this.selectedType == 'air_humidity') {
        this.chartName = 'Humidity';
        this.gaugeLabel = "Humidity";
        this.gaugeAppendText = "%";
        this.min = 40;
        this.max = 80;
      } else if (this.selectedType == 'air_wind') {
        this.chartName = 'Wind';
        this.gaugeLabel = "Wind speed";
        this.gaugeAppendText = "km/h";
        this.min = 0;
        this.max = 30;
      } else if (this.selectedType == 'water_temperature') {
        this.chartName = 'Water Temperature';
        this.gaugeLabel = "Temperature";
        this.gaugeAppendText = "°C";
        this.min = 10;
        this.max = 30;
      } else if (this.selectedType == 'water_salinity') {
        this.chartName = 'Water Salinity';
        this.gaugeLabel = "Salinity";
        this.gaugeAppendText = "%";
        this.min = 3;
        this.max = 4;
      } else if (this.selectedType == 'water_ph') {
        this.chartName = 'pH';
        this.gaugeLabel = "pH";
        this.gaugeAppendText = "";
        this.min = 0;
        this.max = 14;
      }

    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: []
        }
      ],
      chart: {
        id: 'area-datetime',
        toolbar: {
          show: false,
        },
        type: 'area',
        height: 350,
        zoom: {
          autoScaleYaxis: true
        }
      },
      title: {
        text: this.chartName,
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


    this.subscription = dataManager.chartMessages.subscribe(msg => {
      n = Number(msg.x);
      if(msg.msg_type === this.selectedType){
        this.selectedData.x = n;
        this.selectedData.y = msg.y;
      }
      if(this.selectedData.y != ''){
        this.chartOptions.series = [{
          data: this.chartOptions.series[0].data.concat({
            x: this.selectedData.x,
            y: this.selectedData.y
          }
          )
        }]
        this.gaugeValue = +this.selectedData.y;
      }
      
    });
  }
}
