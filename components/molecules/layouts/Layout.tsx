import React, { ReactNode } from 'react'
import Head from 'next/head'
import Nav from './Nav'
import Footer from './Footer'
import PageTitle from '@/components/PageTitle'

type Props = {
  children?: ReactNode
  title?: string
  draft?: boolean
}

const Layout = ({ children, title = 'This is the default title',draft =false }: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    

    <div className='flex-grow w-full bg-dark flex flex-col min-h-screen w-screen h-screen'>
      <header>
        <Nav/>
      </header>
      {draft==true?
      
      (
          <div className="mt-24 text-center min-h-dvh h-full">
            <PageTitle>
              Under Construction{' '}
              <span role="img" aria-label="roadwork sign">
                🚧
              </span>
            </PageTitle>
          </div>
       )
      :children}

      <Footer/>
    </div>
   
  </>
)

export default Layout
