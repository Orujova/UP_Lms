import Image from 'next/image'

//style
import './targetComponentList.scss'

//image
import arrow from '@/images/targetArrow.svg'

export default function TargetComponentList() {
    return (
        <div className='targetComponentList'>
            <div className="title">
                <div>
                    Group name
                </div>
                <div>
                    Number of users
                </div>
            </div>
            <div>
                <div>
                    All Staff
                </div>
                <div>5700</div>
                <Image src={arrow} alt='arrow'/>
            </div>
        </div>
    )
}