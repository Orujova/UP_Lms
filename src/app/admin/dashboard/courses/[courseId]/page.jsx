'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';

//style
import './innerCoursePage.scss';
import CourseButtonsPart from '@/components/courseButtonsPart';
import CourseDetail from '@/components/courseDetail';

export default function Page({ params }) {
    const [courseData, setCourseData] = useState(null);
    const [coursePageChange, setCoursePageChange] = useState('Content')

    useEffect(() => {
        if (params && params.courseId) {
            fetch(`https://bravoadmin.uplms.org/api/Course/${params.courseId}`, {
                method: 'GET',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Veri çekme hatası: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    setCourseData(data);
                })
                .catch(error => {
                    console.error('Hata:', error);
                });
        }
    }, [params]);

    return (
        <div className='coursePage'>
            {courseData && (
                <div>
                    <Image
                        className={'courseBanner'}
                        src={courseData.imageUrl || ''}
                        alt={courseData.name}
                    />
                    <CourseButtonsPart name={courseData.name}/>
                    <CourseDetail createdDate={courseData.createdDate} createdBy={courseData.createdBy} />
                    <div className="coursesPageButtons">
                        <div onClick={() => { setCoursePageChange('Content') }} className={coursePageChange === 'Content' ? 'active coursesPageButton' : 'coursesPageButton'}>
                            Content
                        </div>
                        <div onClick={() => { setCoursePageChange('Learner') }} className={coursePageChange === 'Learner' ? 'active coursesPageButton' : 'coursesPageButton'}>
                            Learner
                        </div>
                        <div onClick={() => { setCoursePageChange('Statistics') }} className={coursePageChange === 'Statistics' ? 'active coursesPageButton' : 'coursesPageButton'}>
                            Statistics
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}