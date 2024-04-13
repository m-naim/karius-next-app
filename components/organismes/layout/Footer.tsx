import { footerRoutes } from '@/data/Routes'
import Link from 'next/link'
import React from 'react'

export default function Footer(props) {
  return (
    <footer className="bg-dark p-4 sm:p-6">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="https://www.bourseHorus.com" className="flex items-center">
              <span className="self-center whitespace-nowrap text-2xl font-bold ">BourseHorus</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
            {footerRoutes.map((f) => (
              <div key={f.key}>
                <p className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  {f.category}
                </p>

                <div>
                  <ul className="text-gray-600 dark:text-gray-400">
                    {f.routes.map((route) => (
                      <li key={route.title}>
                        <Link data-umami-event={`footer-${route.href}`} href={route.href}>
                          {route.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear() + ' '}
            BourseHorus™ . All Rights Reserved.
          </span>

          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <a
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              href="https://twitter.com/BourseHorus"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
