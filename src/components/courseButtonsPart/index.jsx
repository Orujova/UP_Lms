import Image from 'next/image'

//style
import './courseButtonsPart.scss'

//image
import edit from '@/images/editPencil.svg'
import eye from '@/images/eye.svg'
import settings from '@/images/settings.svg'

export default function CourseButtonsPart(props) {
    return (
        <div className='courseButtonsPart'>
            <p className='title'>
                {props.name}
            </p>
            <div className="courseButtons">
                <div className="courseButton">
                    <Image src={edit} alt={'edit'} />
                    <p>Edit course</p>
                </div>
                <div className="courseButton">
                    <Image src={eye} alt={'eye'} />
                    <p>Preview as learner</p>
                </div>
                <div className="setting">
                    <Image src={settings} alt={'setting'}/>
                </div>
            </div>
        </div>
    )
}