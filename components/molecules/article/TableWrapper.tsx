import * as React from 'react'

const TableWrapper = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border/70 bg-card/60 shadow-sm backdrop-blur">
      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
        {children}
      </table>
    </div>
  )
}

export default TableWrapper
