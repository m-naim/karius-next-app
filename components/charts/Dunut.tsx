import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,Title } from 'chart.js';
import { doughnutData } from '../../data/mock/DoughnoutData';
ChartJS.register(ArcElement, Tooltip, Legend, Title);


export function Dunut({data=doughnutData,title}) {
    return (
        <div className='w-full shadow rounded-md p-2 max-w-[30em] bg-dark-primary'>
            <Doughnut
                data={data}

                options={{
                    responsive: true,
                    elements: {
                        arc: {
                            borderWidth: 0,
                        }
                    },
                    cutout:120,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                color: 'white',
                              },
                        },
                        title: {
                            display: true,
                            text: title,
                            color: 'white'
                        },
                        tooltip:{
                            callbacks: {
                                label: function (context) {
                                  return context.formattedValue + '%';
                                }
                              }
                        }
                    },
                }}
            />
        </div>
    );
}
