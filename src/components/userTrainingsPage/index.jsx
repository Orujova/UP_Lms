//style
import TrainingComponent from '../trainingComponent'
import './userTrainingsPage.scss'

//image
import test from '@/images/Frame 427320920.svg'
import test2 from '@/images/test2.svg'
import test1 from '@/images/test1.svg'
import test3 from '@/images/Frame 427320920.png'
import test4 from '@/images/Frame 427320920.jpg'
import test5 from '@/images/test5.svg'

export default function UserTrainingsPage() {
    return (
        <div className='userTrainingsPage'>
            <h3>
                Upcoming
            </h3>
            <div className='trainingsList'>
                <TrainingComponent img={test} title={'Communications skills'} date={'12 Feb 2024'} />
                <TrainingComponent img={test1} title={'Professional PMI'} date={'12 Feb 2024'} />
                <TrainingComponent img={test2} title={'Advanced Power BI'} date={'12 Feb 2024'} />
            </div>

            <h3>
                Completed
            </h3>
            <div className='trainingsList'>
                <TrainingComponent img={test3} title={'Advanced Excel'} date={'12 Feb 2024'} />
                <TrainingComponent img={test4} title={'First Aid'} date={'12 Feb 2024'} />
                <TrainingComponent img={test5} title={'Fire Fighting'} date={'12 Feb 2024'} />
            </div>
        </div>
    )
}
