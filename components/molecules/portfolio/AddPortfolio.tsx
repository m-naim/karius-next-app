import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import React, { useState } from 'react'

function AddPortfolio({ hide, addClick }) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('10000')
  const [visibility, setVisibility] = useState('public')

  return (
    <div className=" bg-dark relative flex flex-col items-center justify-center  gap-6 rounded-md px-12 py-12 shadow-xl md:w-auto ">
      <div className="flex flex-col gap-4 ">
        <div className="flex items-center justify-between gap-8">
          <p className="text-xl font-semibold leading-7 lg:leading-9">Créer un portefeuille</p>
          <div className="-mr-2">
            <button
              type="button"
              onClick={hide}
              className="bg-dark-primary inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Close pop-up</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <h1 role="main" className="text-lg font-semibold leading-7 lg:leading-9">
            Nom du portefeuille
          </h1>
          <input
            className="input-primary"
            type={'text'}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </div>

        <MultiSelect list={['privé', 'public']} active={visibility} select={setVisibility} />

        <div>
          <h1 role="main" className="text-lg font-semibold leading-7 lg:leading-9">
            Valeur initial
          </h1>
          <input
            className="input-primary"
            type="number"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </div>
      </div>
      <button className="btn-primary w-full" onClick={() => addClick({ value, name, visibility })}>
        Ajouter
      </button>
    </div>
  )
}

export default AddPortfolio
