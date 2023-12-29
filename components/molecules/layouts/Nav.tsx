'use client'

import React, { useState } from 'react';
import authService from '@/services/authService';
import logoutIcon from '@/assets/img/logout.svg'
import Link from 'next/link';
import CustomLink from '@/components/atoms/CustomLink';
import Image from 'next/image';
import ThemeSwitch from '@/components/atoms/ThemeSwitch'
import config from '@/services/config';

const draftFeatures = config.features;
const urls = [
    {
        title: "",
        href: "",
        display: false
    }
]

const Links = () => (
    <>
        {!draftFeatures.explore && <CustomLink to="/explore">Explorer</CustomLink>}
        {!draftFeatures.portfolio && <CustomLink to="/portfolios">Mes Portefeuilles</CustomLink>}
        {!draftFeatures.watchlist && <CustomLink to="/watchlists">WatchLists</CustomLink>}
        <CustomLink to="/blog">Blog</CustomLink>
    </>
)

const LinkSyle = ({ to, title }) => <Link href="/watchlists" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{title}</Link>



function Nav(props) {
    // const [popover, setPopover] = useState(false);
    // const user = authService.getCurrentUser();
    // const close = () => setPopover(false);
    // const logout = () => authService.logout();
    return (
        <>
            <header>
                <nav className="bg-dark border-gray-200 py-2 px-4 lg:px-6">
                    <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">

                        <Link className='flex gap-1' href="/">
                            <span className='text-3xl font-large font-bold text-primary '>BourseHorus</span>
                            <span className='text-xs text-primary leading-10' >Beta</span>
                        </Link>


                        <div className="flex items-center lg:order-2">
                            <ThemeSwitch />

                            {/* <div>
                                 {!user ?
                                <Link className='btn-primary h-fit hidden md:block lg:mx-10' href="/login">login</Link>
                                :
                                < >
                                    <Link href="/login" className='btn-primary h-fit hidden md:block lg:mx-10' onClick={logout}>
                                        <Image src={logoutIcon} alt="logout" className="lazy lazyLoaded w-4 text-white" width={30} height={30} />
                                    </Link>
                                </>
                            }
                            </div> */}

                            {/* <div className="-mr-2 flex items-center md:hidden">
                                <button type="button"
                                    onClick={() => setPopover(true)}
                                    className="bg-dark bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
                                    <span className="sr-only">Open main menu</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div> */}
                        </div>

                        <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                <Links />
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <nav className='px-6 box-border flex place-content-between items-center shadow-md overflow-hidden bg-dark-primary  border-b border-slate-500/10'>
                <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'>

                </div>


                <div className='flex place-items-center'>




                </div>




                {/* {popover &&
                    <div onClick={close} className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
                        <div className="bg-dark rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                            <div className="px-5 pt-4 flex items-center justify-between">
                                <Link className='text-3xl font-large font-bold text-sky-600 hover:text-sky-900' href="/">BourseHorus</Link>
                                <div className="-mr-2">
                                    <button type="button"
                                        onClick={close}
                                        className="bg-dark rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="sr-only">Close main menu</span>
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="px-2 pt-2 pb-3 space-y-1 bg-dark">
                                <Links/>
                                {!user ?
                                    <button className='btn-primary'> <Link href="/login" > Se connecter</Link> </button> :
                                    <button className='btn-primary' onClick={logout}>
                                        <Link href="/login" > Se deconnecter</Link>
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                } */}

            </nav>

        </>

    )
}

export default Nav;








