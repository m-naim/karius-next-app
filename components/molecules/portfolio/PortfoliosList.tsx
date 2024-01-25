import Modal from '@/components/molecules/layouts/Modal'
import useModal from '@/components/hooks/UseModal'
import React, { useState, useLayoutEffect } from 'react'
import authService from '@/services/authService'
import portfolioService from '@/services/portfolioService'
import AddPortfolio from './AddPortfolio'
import PftRow from './PftRow'

let pftArray = [
  {
    id: '6119f00b4d1732c6895a81fe',
    owner: {
      name: 'momo',
    },
    name: 'us dividends',
    followers: ['1'],
  },
]

function PortfoliosList(props) {
  const [pftArrayDiplay, setPftArrayDisplay] = useState(pftArray)
  const { isShowing, toggle } = useModal()
  const [view, setview] = useState('p')

  const user = authService.getCurrentUser()

  const fetchData = async () => {
    pftArray = await portfolioService.getMyPortfolios()
    selectView('p')
  }

  useLayoutEffect(() => {
    fetchData()
  }, [])

  const addClick = async (payload) => {
    if (payload.name === '') return
    if (payload.visibilite === '') return
    if (payload.value < 0) return
    try {
      await portfolioService.add(payload)
      fetchData()
      toggle()
    } catch {
      console.log('error')
    }
  }

  const selectView = (v) => {
    setview(v)
    let viewPfts = pftArray
    if (v == 'p') viewPfts = pftArray.filter((p) => p.owner == user.user.id)
    if (v == 'f') viewPfts = pftArray.filter((p) => p.followers.includes(user.user.id))
    console.log(v, user.user.id, viewPfts)
    setPftArrayDisplay(viewPfts)
  }
  const linkClassName =
    'inline-block p-4 rounded-t-lg text-xl text-gray-600 hover:text-gray-900 dark:hover:bg-gray-700 dark:text-gray-300 '
  const activeStyle = 'border-b-4 border-blue-700 dark:text-gray-100 dark:border-blue-500'

  return (
    <div className="bg-dark flex flex-col items-center justify-center p-4">
      <section className="flex w-full max-w-5xl place-content-between p-2">
        <p className="justify-start text-2xl text-sky-700"> </p>
        <button className="btn-primary w-32" onClick={toggle}>
          + Ajouter
        </button>
      </section>

      <div className="w-full max-w-5xl border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-slate-600">
        <ul className="-mb-px flex flex-wrap">
          <li className="mr-2">
            <button
              className={view === 'p' ? linkClassName + activeStyle : linkClassName}
              onClick={() => selectView('p')}
            >
              Mes Portefeuils
            </button>
          </li>
          <li className="mr-2">
            <button
              className={view === 'f' ? linkClassName + activeStyle : linkClassName}
              onClick={() => selectView('f')}
            >
              Suivis
            </button>
          </li>
        </ul>
      </div>

      <Modal isShowing={isShowing} hide={() => toggle()}>
        <AddPortfolio hide={() => toggle()} addClick={addClick} />
      </Modal>
      <div className="flex w-full max-w-5xl flex-col py-6">
        <div className="grid w-full grid-cols-2 place-content-between gap-20 rounded-3xl px-4 md:grid-cols-4 ">
          <p className="hidden text-gray-500 md:block">Name</p>
          <p className="hidden text-gray-500 md:block">Value</p>
          <p className="text-gray-500">Variation</p>
          <p className="hidden text-gray-500 md:block">Positions</p>
        </div>
        {pftArrayDiplay.map((pft) => (
          <PftRow pft={pft} key={pft.id} />
        ))}
      </div>
    </div>
  )
}

export default PortfoliosList
