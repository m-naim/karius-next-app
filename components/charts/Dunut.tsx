import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,Title } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
        {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(2, 88, 232, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderColor: [
                'rgba(2, 88, 232, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
            hoverOffset:40,
        },
    ],
};

const options = {
    responsive: true,
    elements: {
        arc: {
            weigth: 0.1,
            borderWidth: 3,
        }
    },
    cutout:50,
   

}

export function Dunut() {
    return (
        <div className='max-w-md m-10 p-2'>
            <Doughnut
                data={data}

                options={{
                    responsive: true,
                    elements: {
                        arc: {
                            borderWidth: 3,
                        }
                    },
                    cutout:120,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'texte here'
                        },
                
                    }
                }}
            />
        </div>
    );
}
