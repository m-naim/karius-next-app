import React from 'react'
import Selectable from './Selectable'

function MultiSelect({ list, select, active, className = '' }) {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
    >
      {list.map((item) => (
        <Selectable
          key={item}
          activeClass=" bg-dark text-gray-900 dark:text-white dark:bg-slate-600"
          classNameP="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
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
