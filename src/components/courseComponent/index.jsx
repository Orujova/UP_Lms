import Image from 'next/image'
import CourseInformation from '../courseInformation'

//style
import './courseComponent.scss'

//image
import test from '@/images/courseTest.svg'

export default function CourseComponent() {
  return (
    <div className='courseComponent'>
      <div className='image'>
        <Image src={test} alt={'course'} />
      </div>
      <CourseInformation />
    </div>
  )
}