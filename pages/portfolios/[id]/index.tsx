
import { useRouter } from 'next/router';
import PortfolioLayout from '../../../components/portfolio/PortfolioLayout';
import React,{useState,useLayoutEffect} from 'react';
import Table from '../../../components/data/Table';
import portfolioService from '../../../services/portfolioService'
import authService from '../../../services/authService';

const columns=['symbol','weight','qty','last','bep'] 

function PortfolioView({ children, to, ...props }) {
    const router = useRouter()
    const {id} = router.query
    
    
    const [portfolio, setPortfolio] = useState({_id:'',allocation:[],transactions:[]});
    const [editable, setEditable] = useState(false);

    const fetchData = async () => {
        try{
            const data = await portfolioService.get(id as string) ;
            const userId= authService.getCurrentUser().user.id;

            data.allocation= data.allocation.map((item, i) => {
                item.id = i + 1;
                return item;
            });

            data.transactions.forEach((item, i) => {
                item.id = i + 1;
            });
            if(data.owner===userId) setEditable(true);
            setPortfolio(data);
            console.log(portfolio);
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
        const data = await portfolioService.AddTransaction(portfolio._id,sense,ticker,prix,qty,date);
        console.log(data);
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
        <PortfolioLayout>
            <div className='bg-dark-primary p-10 rounded-md shadow'>
                <Table columns={columns} editable={editable} propRows={portfolio.allocation} addtransaction={addtransaction} />
            </div>
        </PortfolioLayout>
    );
}

export default PortfolioView;