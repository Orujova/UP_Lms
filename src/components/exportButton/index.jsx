import React from 'react'

//style
import './exportButton.scss'

export default function ExportButton(props) {
  return (
    <div className='exportButton'>
        {props.text}
    </div>
  )
}