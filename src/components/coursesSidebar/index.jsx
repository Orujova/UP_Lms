'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionComponent from '../sectionComponent';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
    setTargetPage,
    addSection,
    reorderSections,
    setActiveSection,
    updateSectionTitle,
    toggleEditSection
} from '@/redux/course/courseSlice';

//style
import './coursesSidebar.scss';

//image
import backArrow from '@/images/courseBackButton.svg';

export default function CoursesSidebar() {
    const dispatch = useDispatch();

    // Access the current page and sections from Redux
    const { targetPage, sections, activeSection } = useSelector((state) => state.courseReducer);

    // Handle drag and drop reordering
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        dispatch(reorderSections({
            sourceIndex: result.source.index,
            destinationIndex: result.destination.index
        }));
    };

    // Determine navigation behavior based on the current page
    const handleBackNavigation = () => {
        if (targetPage === 'basicInfo') {
            // If we're on basicInfo, go back to the course list
            return (
                <Link href={'/admin/dashboard/courses'}>
                    <Image src={backArrow} alt='back arrow' />
                    <p>Back to course list</p>
                </Link>
            );
        } else {
            // If on other pages, navigate to the previous page
            const previousPage = targetPage === 'courseContent' ? 'basicInfo' : 'courseContent';
            return (
                <button
                    className='backButton'
                    onClick={() => dispatch(setTargetPage(previousPage))}
                >
                    <div className="backContent">
                        <Image src={backArrow} alt='back arrow' />
                        <p>Back</p>
                    </div>
                </button>
            );
        }
    };

    return (
        <div className='coursesSidebar'>
            {/* Navigation back based on the current page */}
            {handleBackNavigation()}

            {/* Show sections only if we're on the course content page */}
            {targetPage === 'courseContent' && (
                <div className="sectionsList">
                    <div className='counterPart'>
                        <div className="counter">
                            <p>Sections</p>
                            <p className='count'>{sections.length}</p>
                        </div>

                        <button className="addButton" onClick={() => dispatch(addSection())}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M1.33325 7.99992L7.99992 7.99992M7.99992 7.99992L14.6666 7.99992M7.99992 7.99992V1.33325M7.99992 7.99992L7.99992 14.6666"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="sections" isDropDisabled = {false} isCombineEnabled = {false} ignoreContainerClipping = {false}>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {sections.map((section, index) => (
                                        <SectionComponent
                                            key={section.id}
                                            section={section}
                                            index={index}
                                            isActive={activeSection === section.id}
                                            onSectionClick={() => dispatch(setActiveSection(section.id))}
                                            onUpdateTitle={(id, newTitle) => dispatch(updateSectionTitle({ id, newTitle }))}
                                            onToggleEdit={(id, isEditing) => dispatch(toggleEditSection({ id, isEditing }))}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}
        </div>
    );
}