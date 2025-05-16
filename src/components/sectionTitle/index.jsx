import Image from 'next/image';
import SectionSetting from '../sectionSetting';
import { useSelector } from 'react-redux';

//style
import './sectionTitle.scss';

//image
import duration from '@/images/clock.svg';

export default function SectionTitle({ isVisible = true }) {
    // Access the active section data from Redux
    const activeSection = useSelector((state) => {
        const sections = state.courseReducer.sections;
        const activeSectionId = state.courseReducer.activeSection;
        return sections.find(section => section.id === activeSectionId);
    });

    // Check if the component should be visible
    if (!isVisible || !activeSection) return null;

    return (
        <div className='sectionTitle'>
            <p>{activeSection.title}</p>
            <div className='icon'>
                <Image src={duration} alt='duration' />
                <SectionSetting sectionId={activeSection.id} />
            </div>
        </div>
    );
}