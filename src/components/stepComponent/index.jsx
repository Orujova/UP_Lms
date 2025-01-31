import React from 'react'

//style
import './stepComponent.scss'

export default function StepComponent(props) {
  return (
    <div className='stepComponent'>
        <p className='stepId'>Step {props.number}.</p>
        <p className='stepText'>{props.text}</p>
    </div>
  )
}