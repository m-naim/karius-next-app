import { useRouter } from 'next/router';
import React,{useState,useLayoutEffect} from 'react';
import Table from '../../data/Table';
import portfolioService from '../../../services/portfolioService'

const columns=['symbol','date','qty','price'] 
function TransactionView(props) {
    const router = useRouter()
    const {id} = router.query
    const [portfolio, setPortfolio] = useState({_id:'',allocation:[],transactions:[]});

    const fetchData = async () => {
        try{
            const data = await portfolioService.get(id as string);

            data.allocation= data.allocation.map((item, i) => {
                item.id = i + 1;
                return item;
            });

            data.transactions.forEach((item, i) => {
                item.id = i + 1;
            });
            setPortfolio(data);
        }
        catch{
            console.log("error api");
            setPortfolio({_id:'',allocation:[],transactions:[]});
        }
    };

    useLayoutEffect(() => {
        fetchData();
    },[]);

    const addtransaction= async (sense,ticker,prix,qty,date)=>{
        console.log([sense,prix,ticker,qty,date]);
        const data = await portfolioService.AddTransaction(portfolio._id,sense,ticker,prix,qty,date);
        data.allocation= data.allocation.map((item, i) => {
            item.id = i + 1;
            return item;
        });

        data.transactions.forEach((item, i) => {
            item.id = i + 1;
        });
        
        setPortfolio(data);
    }

    return (
        <div>
            <Table columns={columns} propRows={portfolio.transactions} addtransaction={addtransaction} type={'transaction'}/>
        </div>
    );
}

export default TransactionView;