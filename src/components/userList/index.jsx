import Image from 'next/image'
import UserComponent from '../userComponent'

//image
import sort from '@/images/sort.svg'
import test from '@/images/Frame 427320675.svg'

//style
import './userList.scss'

export default function UserList({adminApplicationUser}) {
    
    return (
        <div className='userList'>
            <div className='listHead'>
                <div className=''>
                    <p>
                        Full name
                    </p>
                    <Image src={sort} alt={'sort'} />
                </div>
                <div className=''>
                    <p>
                        Contact
                    </p>
                </div>
                <div className=''>
                    <p>
                        Department
                    </p>
                    <Image src={sort} alt={'sort'} />
                </div>
                <div className=''>
                    <p>
                        Position
                    </p>
                    <Image src={sort} alt={'sort'} />
                </div>
                <div className='edit'></div>
            </div>
            {adminApplicationUser.appUsers?.map(user => {
                return (
                    <UserComponent img={test} fullName={`${user.firstName} ${user.lastName}`} id={user.id} phone={user.phoneNumber} department={user.department.name} position={user.position.name} />
                )
            })}
        </div>
    )
}