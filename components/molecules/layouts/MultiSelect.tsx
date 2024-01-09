import React from 'react'
import Selectable from './Selectable'

function MultiSelect({ list, select, active, className = '' }) {
  return (
    <div className={`multi-select p-1 ${className}`}>
      {list.map((item) => (
        <Selectable
          key={item}
          activeClass=" bg-white text-gray-900 dark:text-white dark:bg-slate-600"
          classNameP="font-semibold rounded-md p-1 flex-1 text-gray-500"
          selected={active === item}
          onClick={() => select(item)}
        >
          {item}
        </Selectable>
      ))}
    </div>
  )
}

export default MultiSelect
