import Image from 'next/image'
import CourseContentComponent from '../courseContentComponent'
import CourseLearner from '../courseLearner'

//style
import './courseInformation.scss'

//image
import date from '@/images/dateIcon.svg'
import dots from "@/images/dots.svg"

export default function CourseInformation() {
    return (
        <div className='courseInformation'>
            <div>
                <div>
                    <div className='date'>
                        <Image src={date} alt={'date'} />
                        <p>
                            Created : {"14 Feb 2024"}
                        </p>
                    </div>
                    <div className='created'>
                        <p>
                            Created by : {"@nargiz.Salman"}
                        </p>
                    </div>
                </div>

                <Image src={dots} alt={"dots"} />
            </div>
            <div className='text'>
                <h3>
                    Team working
                </h3>
                <p>
                    This Specialization is intended to help all novice computer users get up to speed with Microsoft 365 quickly. It covers different features of the interface, shows you how to perform basic tasks, and introduces you to the most important tools in Word, PowerPoint, and Excel.
                </p>
            </div>
            <div>
                <CourseContentComponent />
                <div className='line'></div>
                <CourseLearner />
            </div>
        </div>
    )
}