import Toggle from './ThemeToggle';
import React, { useState } from 'react';
import authService from '../services/authService';

import logoutIcon from '../assets/img/logout.svg'
import Link from 'next/link';
import CustomLink from './CustomLink';


function Nav(props) {
    const [popover, setPopover] = useState(false);
    const user = authService.getCurrentUser();
    const close = () => setPopover(false);
    const logout = () => authService.logout();
    return (
        <nav className='px-6 box-border flex place-content-between items-center shadow-md overflow-hidden dark:bg-gray-700'>
            <div className='flex lg:px-14'>

                <div className='p-2 flex gap-1 mx-10'>
                    <Link className='text-3xl font-large font-bold text-primary hover:text-blue-900 dark:text-slate-100' href="/">Karius </Link>
                    <span className='text-[8px] h-5 bg-primary rounded-md p-1' >Beta</span>
                </div>

                <div className='gap-4 justify-center items-center hidden md:flex'>
                    <CustomLink to="/explore">
                        <svg className="mr-2 w-8 h-8 text-blue-700 dark:text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Explorer
                    </CustomLink>
                    <CustomLink to="/portfolios">Mes Portefeuilles</CustomLink>
                    {/* <CustomLink to="/predictions">IA Predictions</CustomLink> */}
                    {/* <CustomLink to="/watchLists">WatchLists</CustomLink> */}
                </div>
            </div>

            <div className='flex place-items-center'>

                {!user ?
                    <Link className='btn-primary h-fit hidden md:block lg:mx-10' href="/login">login</Link>
                    :
                    < >
                        <a href="/login" className='btn-primary h-fit hidden md:block lg:mx-10' onClick={logout}>
                            <img src={logoutIcon} data-src={logoutIcon} alt="logout" className="lazy lazyLoaded w-4 text-white" data-load-priority="0" />
                        </a>
                    </>
                }
                <Toggle />
                <div className="-mr-2 flex items-center md:hidden">
                    <button type="button"
                        onClick={() => setPopover(true)}
                        className="bg-dark bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>



            {popover ?
                <div onClick={close} className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
                    <div className="bg-dark rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="px-5 pt-4 flex items-center justify-between">
                            <Link className='text-3xl font-large font-bold text-sky-600 hover:text-sky-900' href="/">Karius</Link>
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

                            <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-slate-400">Explorer</Link>

                            <Link href="/portfolios" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-slate-400">Mes Portefeuilles</Link>

                            <Link href="/watchLists" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-slate-400">WatchLists</Link>
                
                            {!user ?
                                <button className='btn-primary'> <Link href="/login" > Se connecter</Link> </button>: 
                                <button className='btn-primary' onClick={logout}>
                                <Link href="/login" > Se deconnecter</Link>
                            </button>
                            }
                        </div>
                    </div>
                </div>
                : null}
        </nav>
    );
}

export default Nav;