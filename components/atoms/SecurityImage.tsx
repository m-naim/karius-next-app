import React, { useState } from 'react'

interface SecurityImageProps {
  symbol: string
}

const SecurityImage: React.FC<SecurityImageProps> = ({ symbol }) => {
  const [hasImageError, setHasImageError] = useState(false)

  // Derive initial for placeholder if image fails
  const symbolInitial = symbol ? symbol.charAt(0).toLocaleUpperCase() : ''

  return (
    <>
      {hasImageError ? (
        <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm bg-gray-200 text-xs font-bold text-gray-700">
          {symbolInitial}
        </div>
      ) : (
        <img
          className="h-4 w-4 flex-shrink-0"
          src={`https://financialmodelingprep.com/image-stock/${symbol.toLocaleUpperCase()}.png`}
          alt=""
          onError={() => setHasImageError(true)}
        />
      )}
    </>
  )
}

export default SecurityImage
