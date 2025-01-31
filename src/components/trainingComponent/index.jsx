import Image from 'next/image'

//style
import './trainingComponent.scss'

export default function TrainingComponent(props) {
    return (
        <div className='trainingComponent'>
            <Image src={props.img} alt={'training'} />
            <h4>
                Communications skills
            </h4>
            <p>
                12 Feb 2024
            </p>
        </div>
    )
}