import Image from 'next/image';
import { format } from 'date-fns';

// style
import './courseDetail.scss';

// image
import published from '@/images/published.svg';
import calendar from '@/images/calendar.svg';

export default function CourseDetail(props) {
    const formattedDate = format(new Date(props.createdDate), 'dd MMM yyyy'); 

    return (
        <div className='courseDetail'>
            <div className="published">
                <Image src={published} alt={'published icon'} />
                <p>
                    Published
                </p>
            </div>
            <div className="detailed">
                <Image src={calendar} alt={'calendar'} />
                <p>
                    Created: {formattedDate}
                </p>
            </div>
            <div className="detailed">
                <p>
                    Created by: {props.createdBy}
                </p>
            </div>
        </div>
    );
}
