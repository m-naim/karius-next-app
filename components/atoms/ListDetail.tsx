import * as React from 'react'

import { User } from '../../interfaces'

type ListDetailProps = {
  item: User
}

const ListDetail = ({ item: user }: ListDetailProps) => (
  <div>
    <h1 className='text-black'>Detail for {user.name}</h1>
    <p className='text-black'>ID: {user.id}</p>
  </div>
)

export default ListDetail
