import Modal from '../../layout/Modal';
import useModal from '../../../lib/UseModal';
import React,{useState,useLayoutEffect} from 'react';
import authService from '../../../services/authService';
import portfolioService from '../../../services/portfolioService'
import AddPortfolio from './AddPortfolio';
import PftRow from './PftRow';

let pftArray= [];

function PortfoliosList(props) {
    const [pftArrayDiplay, setPftArrayDisplay] = useState([]);
    const {isShowing, toggle} = useModal();
    const [view, setview] = useState("p");
    
    const user = authService.getCurrentUser();

    const fetchData = async () => {
        pftArray = await portfolioService.getMyPortfolios();
        selectView("p")
    };
    useLayoutEffect(() => {
        fetchData();
    }, []);

    const addClick =async (payload) => {  
        if(payload.name==="") return
        if(payload.visibilite==="") return
        if(payload.value<0) return
        try{
            await portfolioService.add(payload);
            fetchData();
            toggle();
        }
        catch{
            console.log("error");
        }
    }

    const selectView= (v)=>{
        setview(v)
        let viewPfts= pftArray;
        if(v=='p') viewPfts =pftArray.filter(p=> p.owner==user.user.id)
        if(v=='f') viewPfts =pftArray.filter(p=> p.followers.includes(user.user.id))
        console.log(v,user.user.id,viewPfts);
        setPftArrayDisplay(viewPfts);
    }
    let linkClassName = 'inline-block p-4 rounded-t-lg text-xl text-gray-600 hover:text-gray-900 dark:hover:bg-gray-700 dark:text-gray-300 '
    let activeStyle = 'border-b-4 border-blue-700 dark:text-gray-100 dark:border-blue-500'

    return (
        <div className='flex flex-col justify-center items-center bg-dark p-4'>
            <section className='flex w-full max-w-5xl p-2 place-content-between'>
                <p className='text-2xl justify-start text-sky-700'> </p>
                <button className='btn-primary w-32' onClick={toggle}>+ Ajouter</button>
            </section>

            <div className="w-full max-w-5xl text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-slate-600">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">
                        <button className={view==="p"?linkClassName+activeStyle:linkClassName} onClick={()=>selectView("p")}>Mes Portefeuils</button>
                    </li>
                    <li className="mr-2">
                        <button className={view==="f"?linkClassName+activeStyle:linkClassName}  onClick={()=>selectView("f")} >Suivis</button>
                    </li>

                </ul>
            </div>

                <Modal isShowing={isShowing} hide={()=>toggle()}>
                    <AddPortfolio hide={()=>toggle()} addClick={addClick}/>
                </Modal>
            <div className='flex w-full max-w-5xl flex-col py-6'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-20 w-full place-content-between px-4 rounded-3xl '>
                    <p className='hidden md:block text-gray-500'>Name</p>
                    <p className='hidden md:block text-gray-500'>Value</p>
                    <p className='text-gray-500'>Variation</p>
                    <p className='hidden md:block text-gray-500'>Positions</p>
                </div>
                {pftArrayDiplay.map(pft=><PftRow pft={pft}/> )}
            </div>
        </div>
    );
}

export default PortfoliosList;