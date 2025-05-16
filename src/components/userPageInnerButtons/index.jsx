//style
import './userPageInnerButtons.scss'

export default function UserPageInnerButtons(props) {
  return (
    <div className='userPageInnerButtons'>
      <div className={props.value === 'User details' ? 'active' : null} onClick={() => props.function('User details')}>
        User details
      </div>
      <div className={props.value === 'Achivements' ? 'active' : null} onClick={() => props.function('Achivements')}>
        Achivements
      </div>
      <div className={props.value === 'Trainings' ? 'active' : null} onClick={() => props.function('Trainings')}>
        Trainings
      </div>
      <div className={props.value === 'Courses' ? 'active' : null} onClick={() => props.function('Courses')}>
        Courses
      </div>
    </div>
  )
}