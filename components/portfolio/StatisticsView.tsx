import { React, useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import portfolioService from '../../services/portfolioService'

function StatisticsView(props) {
    const { id } = useParams();
    const [portfolio, setPortfolio] = useState();
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        try {
            const data = await portfolioService.getMetrics(id);
            console.log(data);
            setPortfolio(data[0]);
            setLoading(false)
        }
        catch {
            console.log("error api");
            setPortfolio({});
        }
    };

    useLayoutEffect(() => {
        fetchData();
    }, []);

    return loading?
    <div>loading...</div>
    :(
        <div>
            <h3>Analyse quantitative</h3>
            <div className='grid max-w-6xl grid-cols-2 gap-4'>
                {
                    portfolio && Object
                        .entries(portfolio)
                        .map(([k, v]) =>
                            <div className='flex gap-4'>
                                <div>{k}</div>
                                <div>{v}</div>
                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default StatisticsView;