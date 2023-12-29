import PortfolioVariation from '../../data/PortfolioVariation';
import React from 'react';
import { round10 } from '../../../utils/decimalAjustement';
import Link from 'next/link';

function PftRow({pft}) {
    return (
        <Link href={`/portfolios/${pft._id}`} 
        className='grid grid-cols-2 md:grid-cols-4 gap-20 w-full place-content-between border px-4 my-1 py-2 bg-dark-primary rounded-xl hover:bg-gray-50 hover:cursor-pointer dark:hover:bg-gray-600  dark:border-slate-600'>
            <p className='max-w-xs max-h-16 truncate'>{pft.name}</p>
            <p className='hidden md:block '>{round10(pft.total_value,-2)}€</p>
            <PortfolioVariation pft={pft} />
            <p className='hidden md:block' >{pft.assetsNbr}</p>
        </Link>
    );
}

export default PftRow;