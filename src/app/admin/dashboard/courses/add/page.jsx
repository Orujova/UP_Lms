'use client';

import { useSelector } from 'react-redux';
import CoursesBasicInfo from '@/components/coursesBasicInfo';
import CourseContent from '@/components/courseContent';
import TargetGroups from '@/components/targetGroups';
import TargetComponent from '@/components/targetCompenent';
import SectionTitle from '@/components/sectionTitle';

//style
import './addCourses.scss';

export default function Page() {
    // Access state from Redux
    const { targetPage = 'basicInfo' } = useSelector((state) => state.courseReducer);

    const renderContent = () => {
        if (targetPage === 'basicInfo') {
            return <CoursesBasicInfo />
        } else if (targetPage === 'courseContent') {
            return <CourseContent />;
        } else if (targetPage === 'targetGroups') {
            return <TargetGroups />;
        } else {
            return null;
        }
    };

    return (
        <div className='addCourses'>
            <SectionTitle isVisible={targetPage === 'courseContent'} />
            <TargetComponent />
            {renderContent()}
        </div>
    );
}