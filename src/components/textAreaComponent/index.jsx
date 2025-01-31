//style
import './textAreaComponent.scss'

export default function TextAreaComponent(props) {
    return (
        <div className={`textAreaComponent ${props.className}`}>
            <label htmlFor={props.text}>
                {props.text}

                {
                    props.required ?
                        <span>
                            *
                        </span>
                        : null
                }
            </label>
            <input
                id={props.text}
                type="textarea"
                required={props.required}
                name={props.name}
                value={props.value} 
                onChange={props.onChange}
            />
        </div>
    )
}