import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllTargetGroupsAsync } from '@/redux/getAllTargetGroups/getAllTargetGroups';
import Image from 'next/image';

//style
import './courseSavedTarget.scss'

//image
import arrow from '@/images/Chevron Down.svg'

export default function CourseSavedTarget() {
    const dispatch = useDispatch()
    const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];

    useEffect(() => {
        dispatch(getAllTargetGroupsAsync())
    }, [dispatch]);

    return (
        <div className='courseSavedTarget'>
            <div className='title'>
                <div className="text">
                    <div className='groupName'>Group name</div>
                    <div className='number'>Number of users</div>
                </div>
            </div>
            {
                targetGroups.map(targetGroup => {
                    return (
                        <div>
                            <div className="text">
                                <div className='groupName'>{targetGroup.name}</div>
                                <div className='number'>{targetGroup.filterGroupCount}</div>
                            </div>
                            <Image src={arrow} alt="arrow" />
                        </div>
                    )
                })
            }
        </div>
    )
}
