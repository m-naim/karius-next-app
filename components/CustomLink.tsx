import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

function CustomLink({ children, to, ...props }) {

  const router = useRouter();

  let toPath = to.replace("/:*/", "/*/");
  let curentPath = router.asPath.replace("/:*/", "/*/")

  let linkClassName = 'inline-flex group break-normal text-lg text-gray-700 dark:text-slate-400 hover:bg-gray-100 hover:rounded-md hover:text-blue-700 p-2 mx-4 whitespace-nowrap dark:hover:bg-gray-600 dark:hover:text-blue-500'
  let activeStyle = ' border-b-4 border-blue-700 dark:border-blue-500  text-blue-700 dark:text-blue-500 '


  return (
    <div>
      <Link
        className={linkClassName + (toPath === curentPath ? activeStyle : '')}
        href={to}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

export default CustomLink;