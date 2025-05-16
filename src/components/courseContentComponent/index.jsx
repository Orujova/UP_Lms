import Image from 'next/image'

//style
import './courseContentComponent.scss'

//image
import certification from '@/images/certification.svg'

export default function CourseContentComponent() {
    return (
        <div className='courseContentComponent'>
            <h3>
                Contents
            </h3>
            <div>
                <div className='videos'>
                    <p>
                        7
                    </p>
                    <p>
                        Videos
                    </p>
                </div>
                <div className='hours'>
                    <p>
                        4
                    </p>
                    <p>
                        Hours
                    </p>
                </div>
                <div className='quiz'>
                    <p>
                        1
                    </p>
                    <p>
                        Quiz
                    </p>
                </div>
                <div className='certification'>
                    <Image src={certification} alt={'certification'} />
                </div>
            </div>
        </div>
    )
}