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
  private tempData: dataType = {
    x: 0,
    y: ''
  };
  private umidData: dataType = {
    x: 0,
    y: ''
  };
  private windData: dataType = {
    x: 0,
    y: ''
  };
  private waterTemperatureData: dataType = {
    x: 0,
    y: ''
  };
  private waterSalinityData: dataType = {
    x: 0,
    y: ''
  };
  private waterPhData: dataType = {
    x: 0,
    y: ''
  };

  private selectedData: dataType = {
    x: 0,
    y: ''
  };
  public selectedType: string;
  public gaugeLabel;
  public gaugeAppendText;
  gaugeType: NgxGaugeType = "arch";
  gaugeValue = 28.3;
  thresholdConfig = {
    '0': { color: 'green' },
    '40': { color: 'orange' },
    '75.5': { color: 'red' }
  };
  bcolor = 'white';
  constructor(private dataManager: DataManagerService) {
    this.selectedType = this.dataManager.selectedData;
    if (this.selectedType == 'air_temperature') {
        this.chartName = 'Average Temperature';
        this.gaugeLabel = "Temperature";
        this.gaugeAppendText = "°C";
      } else if (this.selectedType == 'air_humidity') {
        this.chartName = 'Humidity';
        this.gaugeLabel = "Humidity";
        this.gaugeAppendText = "%";
      } else if (this.selectedType == 'air_wind') {
        this.chartName = 'Wind';
        this.gaugeLabel = "Wind speed";
        this.gaugeAppendText = "km/h";
      } else if (this.selectedType == 'water_temperature') {
        this.chartName = 'Water Temperature';
        this.gaugeLabel = "Temperature";
        this.gaugeAppendText = "°C";
      } else if (this.selectedType == 'water_salinity') {
        this.chartName = 'Water Salinity';
        this.gaugeLabel = "Salinity";
        this.gaugeAppendText = "%";
      } else if (this.selectedType == 'water_ph') {
        this.chartName = 'pH';
        this.gaugeLabel = "pH";
        this.gaugeAppendText = "";
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
      if (msg.msg_type === 'air_temperature') {
        this.tempData.x = n;
        this.tempData.y = msg.y;
      } else if (msg.msg_type === 'air_humidity') {
        this.umidData.x = n;
        this.umidData.y = msg.y;
      } else if (msg.msg_type === 'air_wind') {
        this.windData.x = n;
        this.windData.y = msg.y;
      } else if (msg.msg_type === 'water_temperature') {
        this.waterTemperatureData.x = n;
        this.waterTemperatureData.y = msg.y;
      } else if (msg.msg_type === 'water_salinity') {
        this.waterSalinityData.x = n;
        this.waterSalinityData.y = msg.y;
      }  else if (msg.msg_type === 'water_ph') {
        this.waterPhData.x = n;
        this.waterPhData.y = msg.y;
      } 

      if (this.selectedType == 'air_temperature') {
        this.selectedData.x = this.tempData.x;
        this.selectedData.y = this.tempData.y;
      } else if (this.selectedType == 'air_humidity') {
        this.selectedData.x = this.umidData.x;
        this.selectedData.y = this.umidData.y;
      } else if (this.selectedType == 'air_wind') {
        this.selectedData.x = this.windData.x;
        this.selectedData.y = this.windData.y;
      } else if (this.selectedType == 'water_temperature') {
        this.selectedData.x = this.waterTemperatureData.x;
        this.selectedData.y = this.waterTemperatureData.y;
      } else if (this.selectedType == 'water_salinity') {
        this.selectedData.x = this.waterSalinityData.x;
        this.selectedData.y = this.waterSalinityData.y;
      } else if (this.selectedType == 'water_ph') {
        this.selectedData.x = this.waterPhData.x;
        this.selectedData.y = this.waterPhData.y;
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
