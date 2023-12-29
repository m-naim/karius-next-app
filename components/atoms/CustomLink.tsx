import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

function CustomLink({ children, to, deep=false, ...props }) {


  let toPath = to.replace("/:*/", "/*/");
  let curentPath =  usePathname()?.replace("/:*/", "/*/")

  let linkClassName = 'inline-flex group break-normal text-lg text-gray-700 dark:text-slate-400 hover:bg-gray-100 hover:rounded-md hover:text-blue-700 p-2 mx-4 whitespace-nowrap dark:hover:bg-gray-600 dark:hover:text-blue-500'
  let altStle= 'block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50  dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
  let lgConditions=''
  
  let activeStyle = ' border-b-4 border-blue-700 dark:border-blue-500  text-blue-700 dark:text-blue-500 '


  return (
    <div>
      <Link
        className={altStle + (toPath === curentPath ? activeStyle : '')}
        href={to}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

export default CustomLink;