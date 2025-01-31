'use client';

import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Image from 'next/image';
import LinkPreview from '@/components/linkPreview';
import {
  setModalVisibility,
  addContentToSection,
  removeContentFromSection,
  reorderContentInSection,
  setFormData,
  openContentForEdit,
  updateExistingContent,
  clearEditingState,
  setTargetPage,
  setTarget
} from '@/redux/course/courseSlice';

// Import styles
import './courseContent.scss';

import deleteIcon from '@/images/Delete 2.svg';
import dotsIcon from '@/images/dots-grid.svg';
import settingsIcon from '@/images/Settings 2.svg';
import uploadIcon from '@/images/Upload.svg';
import pdfIcon from '@/images/pdf-icon.svg';
import excelIcon from '@/images/excel-icon.svg';
import pptxIcon from '@/images/pptx-icon.svg';
import StyledPageModal from './styledPageModal';
import StyledTextBoxModal from './styledTextBoxModal';
import StyledUrlModal from './styledUrlModal';
import StyledUploadModal from './styledUploadModal';
import QuizModal from './quizModal.jsx';

export default function CourseContent() {
  const dispatch = useDispatch();

  // Get the active section data
  const activeSection = useSelector((state) => {
    const sections = state.courseReducer.sections;
    const activeSectionId = state.courseReducer.activeSection;
    return sections.find(section => section.id === activeSectionId);
  });

  const modals = useSelector((state) => state.courseReducer.modals);
  const formData = useSelector((state) => state.courseReducer.formData);

  // Get content items from active section
  const contentItems = activeSection?.contents || [];

  const editingContentId = useSelector((state) => state.courseReducer.formData.editingContentId);
  const editingSectionId = useSelector((state) => state.courseReducer.formData.editingSectionId);

  const handleContentDoubleClick = (sectionId, contentId) => {
    dispatch(openContentForEdit({ sectionId, contentId }));
  };

  const handleNextClick = () => {
    //    e.preventDefault();
    dispatch(setTargetPage('targetGroups'));
    dispatch(setTarget());
  };

  const handleBackClick = () => {
    dispatch(setTargetPage('basicInfo'));
    dispatch(setTarget());

  };

  // Update type mappings to match Redux:
  // page: 0
  // textBox: 1
  // quiz: 2
  // url: 3
  // video: 4
  // file: 5
  // pptx: 6

  const handleSaveTextBox = () => {
    if (formData.textBoxContent.trim()) {
      if (editingContentId) {
        dispatch(updateExistingContent({
          sectionId: editingSectionId,
          contentId: editingContentId,
          updates: {
            type: 1, // textBox type
            contentString: formData.textBoxContent
          }
        }));
      } else {
        dispatch(addContentToSection({
          sectionId: activeSection.id,
          content: {
            id: `content-${Date.now()}`,
            type: 'textBox', // Redux will convert to number 1
            content: formData.textBoxContent
          }
        }));
      }
      dispatch(setFormData({ textBoxContent: '', editingContentId: null, editingSectionId: null }));
      toggleModal('isTextBoxModalVisible', false);
    }
  };

  const handleUrlSave = () => {
    const isValidUrl = formData.url.startsWith('http://') || formData.url.startsWith('https://');
    if (isValidUrl && formData.url.trim()) {
      if (editingContentId) {
        dispatch(updateExistingContent({
          sectionId: editingSectionId,
          contentId: editingContentId,
          updates: {
            type: 3, // url type
            contentString: formData.url
          }
        }));
      } else {
        dispatch(addContentToSection({
          sectionId: activeSection.id,
          content: {
            id: `content-${Date.now()}`,
            type: 'url', // Redux will convert to number 3
            url: formData.url
          }
        }));
      }
      dispatch(setFormData({ url: '', editingContentId: null, editingSectionId: null }));
      toggleModal('isUrlDialogVisible', false);
    }
  };

  const handlePageSave = (pageData) => {
    if (pageData.title.trim() && pageData.description.trim()) {
      if (formData.editingContentId) {
        dispatch(updateExistingContent({
          sectionId: activeSection.id,
          contentId: formData.editingContentId,
          updates: {
            type: 0, // page type
            title: pageData.title,
            description: pageData.description,
            content: pageData.content
          }
        }));
      } else {
        dispatch(addContentToSection({
          sectionId: activeSection.id,
          content: {
            id: `content-${Date.now()}`,
            type: 'page', // Redux will convert to number 0
            title: pageData.title,
            description: pageData.description,
            content: pageData.content
          }
        }));
      }

      dispatch(setFormData({
        pageTitle: '',
        pageDescription: '',
        editorContent: null
      }));
      toggleModal('isPageModalVisible', false);
    }
  };

  const handleFileUpload = (fileData) => {
    if (fileData) {
      dispatch(addContentToSection({
        sectionId: activeSection.id,
        content: {
          id: `content-${Date.now()}`,
          type: 'file', // Redux will convert to number 5
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          icon: fileData.icon,
          contentFile: fileData.file
        }
      }));
    }
    toggleModal('isUploadModalVisible', false);
  };

  const handleQuizSave = (quizData) => {
    if (formData.editingContentId) {
      dispatch(updateExistingContent({
        sectionId: activeSection.id,
        contentId: formData.editingContentId,
        updates: {
          type: 2, // quiz type
          quiz: quizData,
          title: quizData.questions[0]?.title || 'Quiz',
          description: `${quizData.questions.length} questions`
        }
      }));
    } else {
      dispatch(addContentToSection({
        sectionId: activeSection.id,
        content: {
          id: `content-${Date.now()}`,
          type: 'quiz', // Redux will convert to number 2
          quiz: quizData,
          title: quizData.questions[0]?.title || 'Quiz',
          description: `${quizData.questions.length} questions`
        }
      }));
    }

    toggleModal('isQuizModalVisible', false);
    dispatch(clearEditingState());
  };
  // Modal handlers
  const toggleModal = (modalName, isVisible) => {
    dispatch(setModalVisibility({ modalName, isVisible }));
  };

  const handleRemoveItem = (contentId) => {
    dispatch(removeContentFromSection({
      sectionId: activeSection.id,
      contentId // Use contentId instead of index
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    dispatch(reorderContentInSection({
      sectionId: activeSection.id,
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
  };



  // Add a guard for when no section is active
  if (!activeSection) {
    return <div>Please select a section first</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <form className='courseContent'>
        <div className='form'>
          <div className="button">
            <button
              type="button"
              className="add-content-btn"
              onClick={() => toggleModal('isDropdownOpen', !modals.isDropdownOpen)}
            >
              Add Content
            </button>
            {modals.isDropdownOpen && (
              <div className="dropdown">
                <p onClick={() => toggleModal('isPageModalVisible', true)}>Page</p>
                <p onClick={() => toggleModal('isTextBoxModalVisible', true)}>Text box</p>
                <p onClick={() => toggleModal('isQuizModalVisible', true)}>Quiz</p>
                <p onClick={() => toggleModal('isUrlDialogVisible', true)}>Web URL</p>
                <p onClick={() => toggleModal('isUploadModalVisible', true)}>Upload file</p>
                <p>PPTX file</p>
              </div>
            )}
          </div>

          <Droppable droppableId="contentItems" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {contentItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="content-item"
                        onDoubleClick={() => handleContentDoubleClick(activeSection.id, item.id)}
                      >
                        <div className="content-item-wrapper">
                          <div className="content-drag-handle">
                            <div style={{ width: '24px', height: '24px', position: 'relative' }}>
                              <Image src={dotsIcon} alt={'Drag'} />
                            </div>
                          </div>
                          <div className="content-line"></div>
                          {item.uiType === 'page' && (
                            <div>
                              <h4 className="content-title">{JSON.parse(item.contentString).title}</h4>
                              <p className="content-description">{JSON.parse(item.contentString).description}</p>
                            </div>
                          )}
                          {item.uiType === 'textBox' && (
                            <div className="content-text-box">{item.contentString}</div>
                          )}
                          {item.uiType === 'url' && (
                            <div className="content-url">{item.contentString}</div>
                          )}
                          {item.uiType === 'file' && (
                            <div className="content-file">
                              <div className="file-icon">
                                <Image src={item.icon} alt={item.fileType} />
                              </div>
                              <div className="file-name">{item.fileName}</div>
                            </div>
                          )}
                          {item.uiType === 'quiz' && (
                            <div className="quiz-content">
                              <h4 className="content-title">{item.title}</h4>
                              <div className="quiz-info">
                                <span>{item.quizzes[0].questions.length} Questions</span>
                                <span>•</span>
                                <span>Duration: {item.quizzes[0].duration}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="content-actions">
                          <div className="action-icon" onClick={() => handleRemoveItem(item.id)}>
                            <div style={{ width: '24px', height: '24px', position: 'relative' }}>
                              <Image src={deleteIcon} alt={'Delete'} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className='navigation-buttons'>
          <button className='nav-button' onClick={handleBackClick}>Back</button>
          <button className='nav-button' onClick={handleNextClick}>Next</button>
        </div>

        {/* Modals */}
        {modals.isPageModalVisible && (
          <StyledPageModal
            isVisible={modals.isPageModalVisible}
            onClose={() => {
              toggleModal('isPageModalVisible', false);
              dispatch(clearEditingState());
            }}
            pageTitle={formData.pageTitle}
            setPageTitle={(title) => dispatch(setFormData({ pageTitle: title }))}
            pageDescription={formData.pageDescription}
            setPageDescription={(desc) => dispatch(setFormData({ pageDescription: desc }))}
            onSave={handlePageSave}
            isEditing={!!formData.editingContentId}
            initialContent={formData.editorContent}
          />
        )}

        {modals.isTextBoxModalVisible && (
          <StyledTextBoxModal
            isVisible={modals.isTextBoxModalVisible}
            onClose={() => toggleModal('isTextBoxModalVisible', false)}
            textBoxContent={formData.textBoxContent}
            setTextBoxContent={(content) => dispatch(setFormData({ textBoxContent: content }))}
            onSave={handleSaveTextBox}
          />
        )}

        {modals.isUrlDialogVisible && (
          <StyledUrlModal
            isVisible={modals.isUrlDialogVisible}
            onClose={() => toggleModal('isUrlDialogVisible', false)}
            url={formData.url}
            setUrl={(url) => dispatch(setFormData({ url }))}
            onSave={handleUrlSave}
          />
        )}

        {modals.isUploadModalVisible && (
          <StyledUploadModal
            isVisible={modals.isUploadModalVisible}
            onClose={handleFileUpload}
            uploadIcon={uploadIcon}
            pdfIcon={pdfIcon}
            excelIcon={excelIcon}
            pptxIcon={pptxIcon}
            isEditing={!!formData.editingContentId}
            initialFile={formData.selectedFile}
          />
        )}
        {modals.isQuizModalVisible && (
          <QuizModal
            isVisible={modals.isQuizModalVisible}
            onClose={() => {
              toggleModal('isQuizModalVisible', false);
              dispatch(clearEditingState());
            }}
            onSave={handleQuizSave}
            isEditing={!!formData.editingContentId}
            initialData={formData.quizData}
          />
        )}
      </form>
    </DragDropContext>
  );
}