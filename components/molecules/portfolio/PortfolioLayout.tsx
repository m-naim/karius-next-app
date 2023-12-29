import PortfolioVariation from '../../data/PortfolioVariation';
import React, { ReactNode, useLayoutEffect, useState } from 'react';
import authService from '../../../services/authService';
import portfolioService from '../../../services/portfolioService';
import stockService from '../../../services/stock.service';
// import { getVariation } from '../../../utils/portfolio.utils';

import { round10 } from '../../../utils/decimalAjustement';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../layouts/Layout'
import CustomLink from '../../atoms/CustomLink';

type Props = {
  children?: ReactNode
  title?: string
}

const PortfolioLayout = ({ children }: Props) => {
  const router = useRouter()
  const { id } = router.query

  const [followed, setFollowed] = useState(false);
  const [editable, setEditable] = useState(false);
  const [pftData, setPftData]: any = useState([]);
  const [variation, setVariation] = useState(0);
  const [variationPct, setVariationPct] = useState(0);

  const fetchData = async () => {
    const response = await portfolioService.getData(id as string);

    const userId = authService.getCurrentUser().user.id;
    if (response.followers.includes(userId)) setFollowed(true);
    if (response.owner === userId) setEditable(true);
    getDayVariation(response.perfs.total)
    setPftData(response);
    try {
      await stockService.update(id);
    } catch (error) {
      console.log(error);

    }
  };

  const getDayVariation = (total) => {
    if (!total) {
      console.error(total);
      return
    }
    const last = total.length
    setVariation(round10(total[last - 1] - total[last - 2], -2))
    setVariationPct(round10((total[last - 1] - total[last - 2]) / total[last - 2] * 100, -2))
  }

  useLayoutEffect(() => {
    fetchData();
  }, []);

  const follow = async () => {
    try {
      setFollowed(!followed);
      await portfolioService.follow(id);
    }
    catch {
      console.log("error");
    }
  }

  const deletePortfolio = async () => {
    try {
      await portfolioService.deletePortfolio(id);
      router.push("/portfolios");
    }
    catch {
      console.log("error");
    }
  }

  const camputeRandement = () => {
    if (pftData.dividends === undefined) return 0
    const last = pftData.dividends.yearly.values.slice(-1);
    return round10(last / pftData.total_value * 100, -2)
  }

  const getPctRandement = () => {
    if (pftData.dividends === undefined) return 0
    return round10(pftData?.dividends.yearly.values.reduce((cum, e) => cum + e, 0), -2)
  }

  return (
    <Layout>
      <div className=' flex flex-col place-items-center bg-dark w-full overflow-hidden'>
        <div className='flex flex-col items-center bg-dark-primary pt-4 px-4 w-full rounded-md'>
          <div className='flex items-start justify-between max-w-6xl w-full'>

            <div className='flex flex-col self-start items-start'>
              <h2 className='font-bold'>{pftData.name}</h2>
              <p className='text-gray-500'> {pftData.followers?.length} abonnées</p>
            </div>
            <div className='flex gap-4 items-center m-1'>
              <button onClick={follow} className={'flex items-center hover:shadow-md bg-dark-primary py-1 px-4 rounded-xl border focus:outline-none focus:shadow-outline' + (followed ? ' text-amber-500 dark:text-amber-300' : '')}>
                <svg viewBox="0 0 1000 1000" width="1rem" height="1rem" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10,394.5c0-14.8,10.9-23.9,32.7-27.4l295.4-42.2L471,56.9c7.7-16.2,17.2-24.3,28.5-24.3s21.1,8.1,29.5,24.3l131.9,267.9l295.4,42.2c22.5,3.5,33.8,12.7,33.8,27.4c0,8.4-5.3,17.9-15.8,28.5L760,630.8l50.6,294.3c0.7,2.8,1.1,7,1.1,12.7c0,7.7-2.1,14.4-6.3,20c-4.2,5.6-10.2,8.8-17.9,9.5c-7,0-14.8-2.5-23.2-7.4L499.5,820.7L235.7,959.9c-9.1,4.9-17.2,7.4-24.3,7.4c-7.7,0-13.7-3.2-17.9-9.5c-4.2-6.3-6.3-13-6.3-20c0-2.8,0.4-7,1.1-12.7l50.6-294.3L24.8,423C14.9,412.4,10,402.9,10,394.5L10,394.5z"
                  />
                </svg>
                <span className='text-base font-medium ml-1 dark:text-gray-300'>{followed ? 'Suivis' : 'Suivre'}</span>
              </button>

              {editable &&
                <>
                  <button onClick={deletePortfolio} className='border hover:shadow-md bg-dark-primary py-1 px-4 rounded-xl focus:outline-none focus:shadow-outline'>Supprimer</button>
                  <button className='border hover:shadow-md bg-dark-primary py-1 px-4 rounded-xl focus:outline-none focus:shadow-outline'>Modifier</button>
                </>
              }
              {/* <button className='shadow-md text-gray-500  hover:bg-gray-100 text-white py-1 px-4 rounded-xl border focus:outline-none focus:shadow-outline'>Partager</button> */}
            </div>
          </div>
          <div className="w-full max-w-6xl text-xl font-medium text-center text-gray-400 overflow-auto">
            <ul className="flex pt-2 gap-10">
              <li className="mr-2 p-1 rounded-md">
                <CustomLink to={`/portfolios/${id}`}>Valeurs</CustomLink>
              </li>
              <li className="mr-2 p-1 rounded-md">
                <CustomLink to={`/portfolios/${id}/performance`}>Performance</CustomLink>
              </li>
              <li className="mr-2 p-1 rounded-md">
                <CustomLink to={`/portfolios/${id}/pies`}>Diversification</CustomLink>
              </li>
              {/* <li className="mr-2">
              <CustomLink to={`/portfolios/${id}/orders`}>Transactions</CustomLink>
            </li> */}
              <li className="mr-2 p-1 rounded-md">
                <CustomLink to={`/portfolios/${id}/dividends`}>Dividendes</CustomLink>
              </li>
              {/* <li className="mr-2">
              <CustomLink to={`/portfolios/${id}/stats`}>Statistiques</CustomLink>
            </li> */}
            </ul>
          </div>
        </div>

        <div className='flex justify-between m-2 max-w-4xl w-full'>
          <div className='flex flex-col p-4 bg-dark-primary rounded-md'>
            <p className='text-sm'>Valeur Total</p>
            <div className='flex gap-4'>
              <p className='text-xl'>{round10(pftData.total_value, -2)}€</p>
              <PortfolioVariation pft={pftData} />
            </div>
          </div>

          <div className='flex flex-col p-4 bg-dark-primary rounded-md'>
            <p className='text-sm'>Variation du jour</p>
            <div className='flex gap-4'>
              <p className='text-xl'>{variation}€</p>
              <p>{variationPct}%</p>
            </div>
          </div>

          <div className='flex flex-col p-4 bg-dark-primary rounded-md'>
            <p className='text-sm'>Rendement</p>
            <div className='flex gap-4'>
              <p className='text-xl'>{getPctRandement()}€</p>
              <p>+{camputeRandement()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-dark md:p-6 w-full max-w-6xl rounded-md">
          {children}
        </div>

      </div>
    </Layout>
  )
}

export default PortfolioLayout
