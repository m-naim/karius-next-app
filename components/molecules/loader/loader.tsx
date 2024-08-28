import React from 'react'
import 'css/loader.css'
function Loader() {
  return (
    <div className="flex w-full justify-center">
      <div className="content">
        <div className="planet">
          <div className="ring"></div>
          <div className="cover-ring"></div>
          <div className="spots">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Chargement</p>
      </div>
    </div>
  )
}

export default Loader
