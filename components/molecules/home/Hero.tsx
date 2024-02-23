'use client'
import Image, { ImageLoaderProps } from 'next/image'
import React from 'react'
import btc from '@/assets/img/crypto.btc.svg'
import Eth from '@/components/icons/crypto.eth.svg'
import Googl from '@/components/icons/google.svg'
import Msft from '@/components/icons/crypto.btc.svg'

import 'css/hero.css'

const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png'
}

export default function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            L'application de gestion de portefeuilles boursiers
          </h1>
          <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
            Gérez, Partagez et Analysez Votre Portefeuille Boursier Comme Jamais Auparavant.
          </p>
          {/* <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                        Essayer Gratuitement
                        <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </Link> */}
        </div>
        <div className="hidden lg:col-span-5 lg:mt-0 lg:flex">
          <div className="crypto-block h-80 w-full max-w-sm ">
            {/* <Image src={btc} alt="crypto" className="lazy lazyLoaded" width={30} height={30} /> */}
            <Eth alt="crypto" className="crypto-wrap-2 animate-bounce" />
            <Googl alt="crypto" className="crypto-wrap-3 animate-bounce" />
            <Msft alt="crypto" className="crypto-wrap-4 animate-bounce" />
            <Image
              src="/static/images/processor.png"
              alt="processor"
              className="crypto-wrap-5"
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
