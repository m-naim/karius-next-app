import React from 'react'
import ReactDOM from 'react-dom'

const Modal = ({ isShowing, hide, children }) => {
  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div className="relative flex items-center justify-center" />
          <div
            className="sticky-0 fixed top-0 h-full w-full bg-slate-400/50"
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <div className=" flex  items-center justify-center px-4 py-32 2xl:container md:px-28 2xl:mx-auto">
              {children}
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null
}

export default Modal
