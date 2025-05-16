import Image from 'next/image'

//style
import './courseLearner.scss'

//image
import img1 from '@/images/image1.svg'
import img2 from '@/images/image2.svg'
import img3 from '@/images/image3.svg'
import img4 from '@/images/image4.svg'

export default function CourseLearner() {
    return (
        <div className='courseLearner'>
            <div>
                <p>
                    Total Learner
                </p>
                <div className='learnersImage'>
                    <Image src={img1} alt={'leaerner'} />
                    <Image src={img2} alt={'leaerner'} />
                    <Image src={img3} alt={'leaerner'} />
                    <Image src={img4} alt={'leaerner'} />
                    <div>
                        +78
                    </div>
                </div>
            </div>
            <div>
                <p>
                    Completion Rate
                </p>

                <p>
                82% completed this course
                </p>
            </div>
        </div>
    )
}