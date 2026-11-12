import { Table as TableType } from '@tanstack/react-table'
import SimpleDataTable from './SimpleDataTable'

interface PortfolioTableProps {
  table: TableType<any>
  colSpan: number
  onRowClick?: (security: any) => void
  selectedSymbol?: string | null
  canOpenRow?: (security: any) => boolean
}

const PortfolioTable = ({ selectedSymbol, ...props }: PortfolioTableProps) => (
  <div className="portfolio-table min-w-0">
    <SimpleDataTable
      {...props}
      selectedId={selectedSymbol}
      compactMobile
      showFooter={false}
    />
  </div>
)

export default PortfolioTable
