import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Nav from './Nav'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div className='bg-dark flex flex-col min-h-screen'>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <header>
      <Nav/>
    </header>
    <body className='flex-grow'>
      {children}
    </body>
    <footer className='bg-dark'>
      <nav>
        <Link href="/">Home</Link> | <Link href="/about">About</Link> |{' '}
        <Link href="/users">Users List</Link> {' '} | <Link href="/charts">charts</Link> |
        <a href="/api/users">Users API</a>
      </nav>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </div>
)

export default Layout
