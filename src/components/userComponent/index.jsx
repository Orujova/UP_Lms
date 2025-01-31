import Image from 'next/image'
import Link from 'next/link'

//style
import './userComponent.scss'

//image
import phone from '@/images/phone.svg'
import edit from '@/images/edit.svg'

export default function UserComponent(props) {
  return (
    <div className='userComponent'>
      <div>
        <Image src={props.img} alt={'user'} />
        <div className='userName'>
          <p className='fullName'>
            {props.fullName}
          </p>
          <p className='userId'>
            ID: {props.id}
          </p>
        </div>
      </div>
      <div>
        <Image src={phone} alt='phone icon' />
        <p>
          {props.phone}
        </p>
      </div>
      <div>
        <p>
          {props.department}
        </p>
      </div>
      <div>
        <p>
          {props.position}
        </p>
      </div>
      <Link href={'/admin/dashboard/users/10905'} className='edit'>
        <Image src={edit} alt={'edit'} />
      </Link>
    </div>
  )
}