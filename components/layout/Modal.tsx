import React from 'react';
import ReactDOM from 'react-dom';


const Modal = ({ isShowing, hide, children }) => {
  


  return (isShowing ? 
    ReactDOM.createPortal(
    <React.Fragment>
      <div className="relative flex justify-center items-center"/>
      <div className="w-full h-full top-0 fixed sticky-0 bg-slate-400/50" aria-modal aria-hidden tabIndex={-1} role="dialog">
        <div className=" 2xl:container  2xl:mx-auto py-32 px-4 md:px-28 flex justify-center items-center">
          { children}
        </div>
      </div>
    </React.Fragment>, document.body
    ) 
    : null); 
}


export default Modal;