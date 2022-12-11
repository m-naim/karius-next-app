import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2'
import palette from 'google-palette';
import portfolioService from '../../../services/portfolioService'
import { useRouter } from 'next/router';
import PortfolioLayout from '../../../components/portfolio/PortfolioLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);


const defaultData = {
  labels: ['a', 'b'],
  datasets: [
    {
      backgroundColor: palette('tol-rainbow', 10).map((hex) => '#' + hex),
      data: [10.1, 20],
      hoverOffset:40
    }
  ]
};

const tooltip = {
  callbacks: {
    label: function (context) {
      const labelIndex = (context.datasetIndex * 2) + context.dataIndex;
      return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue + '%';
    }
  }
}

function Pies() {
  const router = useRouter()
  const {id} = router.query

  const [actions, setActions] = useState(defaultData);
  const [secteurs, setSecteurs] = useState(defaultData);
  const [industries, setIndustries] = useState(defaultData);
  const [devises, setDevises] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await portfolioService.get(id as string);
      getDistrib(result.allocation, 'name', setActions);
      getDistrib(result.allocation, 'currency', setDevises);
      getDistrib(result.allocation, 'sector', setSecteurs);
      getDistrib(result.allocation, 'industry', setIndustries);

      setLoading(false)
    }
    catch {
      console.log("error api");
    }
  };

  const getDistrib = (allocation, selctor, setState) => {

    var fruits = allocation.reduce((fruitsCount, current) => {
      const index = fruitsCount.findIndex((elm) => elm.name === current.asset[selctor]);
      if (index >= 0) {
        fruitsCount[index].weight += current.weight;
        return fruitsCount;
      } else {
        fruitsCount.push({ weight: current.weight, name: current.asset[selctor] });
        return fruitsCount;
      }
    }, [])

    prepareData(fruits, setState);
  }

  const prepareData = (allocation, setter) => {
    let data = {
      labels: [],
      datasets: [
        {
          backgroundColor: '',
          data: [],
          hoverOffset:20,
        }
      ]
    };


    data.labels = allocation.map(s => s.name)
    data.datasets[0].data = allocation.map(s => s.weight * 100)
    data.datasets[0].backgroundColor = palette('tol-rainbow', allocation.length).map(function (hex) {
      return '#' + hex;
    })
    setter(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDisplay = (type) => {

    if (type === 'Actions')
      return actions;
    if (type === 'Secteurs')
      return secteurs;
    if (type === 'Industries')
      return industries;
    if (type === 'Devises')
      return devises;
    return ""
  }


  return loading ? <PortfolioLayout><div>wait</div></PortfolioLayout> :
    <PortfolioLayout>
      <div className='w-full gap-4 flex flex-wrap place-content-around p-4  '>
        {['Actions', 'Secteurs', 'Industries', 'Devises'].map(type => {
          return (

            <div className='w-full lg:w-1/3 shadow rounded-md p-2 max-w-[25em]' >
              <Doughnut

                data={{
                  labels: getDisplay(type)['labels'],
                  datasets: getDisplay(type)['datasets']
                }}

                options={{
                  responsive: true,
                  layout:{
                    padding:20,
                  },
                  elements:{
                    arc:{
                      borderWidth: 0,
                    }
                  },
                  cutout:80,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: type
                    },
                  
                  }
                
                }} 
                
                />
            </div>
          )
        }
        )
        }
      </div >
    </PortfolioLayout>
    ;
}

export default Pies;