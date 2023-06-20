"use strict";

define(["vue","Chart","jquery"], function (Vue,Chart,Jquery) {
    var vueComponent = Vue.extend({
        template: '<canvas :id="id" height="75"></canvas>',
        data: function data() {
            return {
                GL_Chart:null,
                ChartData:  {
                    type: 'line',
                    data: {
                        labels: this.labels,
                        datasets: [{
                            label:"",
                            backgroundColor: this.backcolor,
                            borderColor: this.bordercolor,
                            borderWidth: 2,
                            data: this.value,
                            pointRadius: 0,
                        }]
                    },
                    options: {
                        responsive: true,
                        scaleShowLabels:false,
                        maintainAspectRatio:false,
                        title: {
                            display: false,
                            text: this.title
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false,
                        },
                        legend: {
                            display: false
                        },
                        layout: {
                            padding: {
                                left: 0,
                                right:20,
                                top: 0,
                                bottom: 0
                            }
                        },
                        elements: {
                            line:{
                                tension:0.000001,
                            }
                        },
                        scales: {
                            yAxes: [{
                              gridLines: {
                                drawBorder: true,
                                //drawTicks:false,
                                display: false,
                              },
                              scaleLabel:{
                                display:false
                              },
                              ticks: {
                                beginAtZero: true,
                                display:false
                              }
                            }],
                            xAxes: [{
                                gridLines: {
                                  drawBorder: true,
                                  //drawTicks:false,
                                  display: false,
                                },
                                scaleLabel:{
                                  display:false
                                },
                                ticks: {
                                  beginAtZero: true,
                                  display:false
                                }
                              }]
                          },
                    }
                },
            };
        },
        props: {
            id: {
                type: String,
                default: ""
            },
            title: {
                type: String,
                default: ""
            },
            labels:{
                type: Array,
                default:[]
            },
            value:{
                type: Array,
                default:[]
            },
            backcolor: {
                type: Object,
                default:{}
            },
            bordercolor: {
                type: Object,
                default:{}
            }
        },
        mounted: function mounted() {
            var chart = $('#'+this.id);
            this.GL_Chart = new Chart(chart,this.ChartData);
        },

        watch: {
            value: function  value(){
                    this.GL_Chart.data.datasets[0].data = this.value;
                    this.GL_Chart.update()
                   // console.log(this.value)
            },
            labels: function labels(){
                this.GL_Chart.data.labels = this.labels;
                this.GL_Chart.update()                   
            }
        }
    });
    return vueComponent;
});