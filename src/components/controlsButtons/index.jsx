import AddButton from '../addButton'
import ExportButton from '../exportButton'
import FilterComponent from '../filterComponent'

//style
import './controlsButtons.scss'

export default function ControlsButtons(props) {
    return (
        <div className='controlsButtons'>
            <div className='counter'>
                <p>
                    {props.count}
                </p>
                <p>
                    {props.text}
                </p>
            </div>
            <div className="buttons">
                <FilterComponent />
                <AddButton text={props.buttonText} link={props.link}/>
                <ExportButton text={'Export'}/>
            </div>
        </div>
    )
}