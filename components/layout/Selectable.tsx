import React from 'react';

let defaultClasseName= "inline-block bg-gray-100 text-gray-700 font-bold px-4 rounded-md w-fit hover:shadow-md whitespace-nowrap dark:text-gray-500";
const defaultActive= " border-b-4 border-sky-500 dark:text-gray-100";

function Selectable({children,onClick,selected, classNameP=defaultClasseName,activeClass=defaultActive,...props}) {
    let className= classNameP;
    if(selected) className=classNameP+ activeClass;

    return (
        <button 
        onClick={onClick}
        className={className}>{children}</button>
    );
}

export default Selectable;