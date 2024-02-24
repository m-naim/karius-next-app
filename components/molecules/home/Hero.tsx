'use client'
import Image, { ImageLoaderProps } from 'next/image'
import React from 'react'
import Eth from '@/components/icons/crypto.eth.svg'
import Googl from '@/components/icons/google.svg'
import Msft from '@/components/icons/crypto.btc.svg'

import 'css/hero.css'

const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png'
}

export default function Hero() {
  return (
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
  )
}
