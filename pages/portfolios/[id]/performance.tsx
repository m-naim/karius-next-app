import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'
import portfolioService from '../../../services/portfolioService';
import { add, format } from 'date-fns';
import MultiSelect from '../../../components/layout/MultiSelect';
import PortfolioLayout from '../../../components/portfolio/PortfolioLayout';
import { useRouter } from 'next/router';

let dataSetItem = {
    label: "Performance",
    backgroundColor: 'rgb(109, 99, 255)',
    borderColor: 'rgb(132, 149, 243)',
    data: [0, 1],
}
const chartDataInit = {
    labels: [],
    datasets: [dataSetItem]
}

const chartOptions = {

    responsive: true,
    maintainAspectRatio: false,
    radius: 0,
    scales: {
        x: {

            ticks: {
                callback: function (val, index) {
                    return val % 3 == 0 ? this.getLabelForValue(val) : '';
                },
            },
            grid: {
                display: true,
                drawBorder: true,
                drawOnChartArea: false,
                drawTicks: true,
            }

        },
        y: {
            ticks: {
                callback: function (val, index) {
                    return this.getLabelForValue(val) + '%';
                },
            }
        }
    },
    intersect: true,
    interaction: {
        intersect: false,
        mode: 'index',
    },
}

const BenchMarkChois = {
    "CAC40": "FCHI",
    "S&P500": "GSPC"
}

const listBenchMarks = ["CAC40", "S&P500"];
let perfsData = {};
let datesInit = [];

const AllTimePerfs = {};
const benchMarks = [];

const palette = ['rgb(209, 99, 255)', 'rgb(109, 199, 55)'];

function Performance() {
    const router = useRouter()
    const { id } = router.query;

    const [name, setName] = useState("");
    const [dates, setDates] = useState(chartDataInit.labels);
    const [perfs, setPerfs] = useState(chartDataInit.datasets[0].data)
    const [loading, setLoading] = useState(true);

    const [period, setPeriod] = useState('ALL');
    const [graphType, setType] = useState('%Variation');

    const [benchmarksPerfs, setBenchmarksPerfs] = useState([]);

    const formatDateStr = (input) => {
        return input.map(s => format(new Date(s), "dd/MM/yyyy"))
    }
    const fetchData = async () => {
        try {
            await portfolioService.getPerformances(id);
            const data = await portfolioService.get(id);
            datesInit = formatDateStr(data.perfs.date);
            perfsData = data.perfs;

            setName(data.name);
            setDates(datesInit)
            setPerfs(perfsData.performance);
            setLoading(false)
        }
        catch {
            console.log("error api");
        }
    };

    const AddBenchMarck = async (data, label, color = 'rgb(109, 99, 255)') => {
        console.log('Add!!!');
        let dataset = {
            label,
            data,
            backgroundColor: color,
            borderColor: color
        }

        AllTimePerfs[label] = data

        let item = benchMarks.filter(o => o.label === label)
        if (item.length < 1) benchMarks.push(dataset)

        setBenchmarksPerfs(prev => {
            let item = prev.filter(o => o.label === label)
            console.log(item);
            if (item.length > 0) return prev
            return [dataset, ...prev]
        }
        );

    }

    const fetchIndex = async (idxName, length = datesInit.length) => {

        const data = await portfolioService.getStocksContains(idxName);
        console.log(data);
        let values = data[0].history.slice(-length).map(h => h.Close)

        let x = 1;
        let perfs = values.map((currVal, index) => {
            if (index === 0) {
                return 0;
            }

            const prevVal = values[index - 1];
            return ((currVal - prevVal) / prevVal);
        })
            .map(v => {
                x = x * (1 + v);
                return (x - 1) * 100;
            }
            );

        return perfs;

    };


    useEffect(() => {
        fetchData();

    }, []);


    const handlePeriodClick = (period) => {
        setPeriod(period);
        const cac40Index = benchmarksPerfs.findIndex((obj => obj.label === 'CAC40'));
        const sp500Index = benchmarksPerfs.findIndex((obj => obj.label === 'S&P500'));

        let perf = perfsData.performance
        let data
        let days = datesInit.length
        switch (period) {
            case 'ALL':
                break;
            case '1M':
                days = 30;
                break;
            case '6M':
                days = 180;

                break;
            case '1Y':
                days = 365;
                break;
            default:
                break;
        }

        data = perfsData.performance.slice(-days)
        if (period != 'ALL') perf = data.map(x => (x - data[0]));
        setDates(datesInit.slice(-days));
        setPerfs(perf);

        let bcopy = benchmarksPerfs
        bcopy[cac40Index].data = AllTimePerfs['CAC40'].slice(-days).map(x => x - AllTimePerfs['CAC40'][AllTimePerfs['CAC40'].length - days])
        bcopy[sp500Index].data = AllTimePerfs['S&P500'].slice(-days).map(x => x - AllTimePerfs['S&P500'][AllTimePerfs['S&P500'].length - days])
        setBenchmarksPerfs(bcopy)

    }

    const handleTypeSelect = (type) => {
        setType(type)
        switch (type) {
            case 'Valeur':
                setBenchmarksPerfs([])
                setPerfs(perfsData.total);
                break;
            case '%Variation':

                setBenchmarksPerfs(benchMarks)
                setPerfs(perfsData.performance);
                break;
            case 'Profits/Pertes':
                setBenchmarksPerfs([])
                setPerfs(perfsData.pnl);
            default:
                break;
        }
    }

    const BenchMarkClick = async (symbol, name) => {
        let res = await fetchIndex(symbol)
        AddBenchMarck(res, name, palette[listBenchMarks.findIndex(e => e === name)])
    }

    const deleteBenchItem = (label) => {
        console.log('deleteBenchItem ' + label);
        setBenchmarksPerfs(prev => {
            return prev.filter(o => o.label !== label)
        }
        );
    }
    return (
        loading ?
            <PortfolioLayout>
                <div className='bg-dark'>Calcule de performances en cours ...</div>
            </PortfolioLayout> :
            <PortfolioLayout>
                <div className='flex flex-col lg:flex-row max-w-6xl bg-dark'>

                    <div className='md:p-6 mt-2 flex flex-wrap justify-between items-center w-full'>
                        <MultiSelect className='w-full md:max-w-[300px]' list={['Valeur', 'Profits/Pertes', '%Variation']} active={graphType} select={handleTypeSelect} />

                        <div className='w-full m-2 min-h-[400px] order-2 md:order-3'>
                            {
                                dates.length > 0 ?
                                    <Line redraw id={'perf'} options={chartOptions}
                                        data={{
                                            labels: dates,
                                            datasets: [{
                                                label: "Performance",
                                                backgroundColor: 'rgb(109, 99, 255)',
                                                borderColor: 'rgb(109, 99, 255',
                                                data: perfs,

                                            }, ...benchmarksPerfs]
                                        }} /> : null}

                        </div>
                        <MultiSelect className='w-full md:max-w-xs order-3 md:order-2' list={['1M', '6M', '1Y', 'ALL']} active={period} select={handlePeriodClick} />
                    </div>

                    <div className='w-1/2 min-w-[10em] m-10'>

                        <div className='flex m-4 gap-4'>

                            {listBenchMarks.filter(x => !benchmarksPerfs.map(b => b.label).includes(x)).map(b =>
                                <div className='bg-primary rounded-lg shadow p-4 cursor-pointer' onClick={() => BenchMarkClick(BenchMarkChois[b], b)}>{b}</div>
                            )}

                        </div>

                        <div>
                            <h3 className='m-4 text-xl text-gray-600'>Comparaison</h3>
                            {benchmarksPerfs.map(item =>
                                <>
                                    <div className='flex justify-between p-4 shadow m-1 rounded-md border border-gray-600'>
                                        <p> {item.label} </p>
                                        <p className='cursor-pointer text-lg font-bold w-fill' onClick={() => deleteBenchItem(item.label)}>x</p>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </PortfolioLayout>
    );
}

export default Performance;