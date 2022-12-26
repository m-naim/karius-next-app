import { GetServerSideProps, GetStaticProps } from 'next'

import { User } from '../../interfaces'
import { sampleUserData } from '../../utils/sample-data'
import Layout from '../../components/Layout'
import PftRow from "../../components/portfolio/PftRow";

import portfolioService from '../../services/portfolioService'

type Props = {
  items: User[],
  pftArray: any[]
}
const Explorer = ({ pftArray,items }: Props) => {
  return (
    <Layout title="Explorer | Karius">

      <div className='flex flex-col justify-center items-center bg-dark'>

          <section className='w-full bg-dark-primary flex justify-center p-4'>
            <div className='flex w-full lg:w-2/3 m-2 '>
              <p className='text-2xl justify-start text-primary'>Explorer</p>
            </div>
          </section>

          <div className='flex w-full lg:w-2/3 flex-col'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-20 w-full place-content-between px-4 rounded-3xl '>
                  <p className='hidden md:block text-gray-500'>Nom</p>
                  <p className='hidden md:block text-gray-500'>valeur</p>
                  <p className='text-gray-500'>Variation</p>
                  <p className='hidden md:block text-gray-500'>Positions</p>
              </div>
              {pftArray.map(pft=><PftRow pft={pft}/> )}
          </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {

  const items: User[] = sampleUserData
  const pftArray = await portfolioService.getAll();  
  return { props: { pftArray,items } }
}

export default Explorer;
