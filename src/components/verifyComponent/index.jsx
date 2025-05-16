import React from 'react'

//style
import './verifyComponent.scss'

export default function VerifyComponent(props) {
    return (
        <div className='verifyComponent'>
            <input type="checkbox" id={props.text}/>
            <label className="switch" htmlFor={props.text}>
                <div className="round"></div>
            </label>
            <span>{props.text}</span>
        </div>
    )
}