import React from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';

//style
import './targetComponent.scss';

//image
import pendingIcon from '@/images/targetPending.svg';
import line from '@/images/line.svg';
import emptyIcon from '@/images/targetEmpty.svg';
import doneIcon from '@/images/done.svg';

export default function TargetComponent() {
    // Access the target state directly from Redux
    const target = useSelector((state) => state.courseReducer.target) || {};
    const basicInfo = target.basicInfo || { pending: false, done: false };
    const courseContent = target.courseContent || { pending: false, done: false };
    const targetGroups = target.targetGroups || { pending: false, done: false };

    return (
        <div className='targetComponent'>
            <Image src={line} alt="line" />

            <div>
                {/* Basic Info Section */}
                <div className='pending'>
                    {basicInfo.pending ? (
                        <Image src={pendingIcon} alt='pending' />
                    ) : basicInfo.done ? (
                        <Image src={doneIcon} alt='done' />
                    ) : (
                        <Image src={emptyIcon} alt='empty' />
                    )}
                    <p>Basic Info</p>
                </div>

                {/* Course Content Section */}
                <div>
                    {courseContent.pending ? (
                        <Image src={pendingIcon} alt='pending' />
                    ) : courseContent.done ? (
                        <Image src={doneIcon} alt='done' />
                    ) : (
                        <Image src={emptyIcon} alt='empty' />
                    )}
                    <p>Course Content</p>
                </div>

                {/* Target Groups Section */}
                <div>
                    {targetGroups.pending ? (
                        <Image src={pendingIcon} alt='pending' />
                    ) : targetGroups.done ? (
                        <Image src={doneIcon} alt='done' />
                    ) : (
                        <Image src={emptyIcon} alt='empty' />
                    )}
                    <p>Target Groups</p>
                </div>
            </div>
        </div>
    );
}