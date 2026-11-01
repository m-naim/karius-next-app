import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  const pageNumbers = Array.from(
    new Set(
      [0, page - 1, page, page + 1, totalPages - 1].filter(
        (index) => index >= 0 && index < totalPages
      )
    )
  )
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page <strong className="text-foreground">{page + 1}</strong> sur{' '}
        <strong className="text-foreground">{totalPages}</strong>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Précédent
        </Button>
        {pageNumbers.map((pageIndex, index) => (
          <Fragment key={pageIndex}>
            {index > 0 && pageNumbers[index - 1] !== pageIndex - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              variant={page === pageIndex ? 'default' : 'ghost'}
              size="sm"
              className="h-9 w-9"
              onClick={() => onChange(pageIndex)}
            >
              {pageIndex + 1}
            </Button>
          </Fragment>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Suivant
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
import { Fragment } from 'react'
