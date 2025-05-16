import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    target: {
        basicInfo: { pending: true, done: false },
        courseContent: { pending: false, done: false },
        targetGroups: { pending: false, done: false },
    },
    targetPage: 'basicInfo',
    formData: {
        // API fields
        Name: '',
        Description: '',
        TargetGroupId: '1',
        VerifiedCertificate: false,
        Duration: '200',
        CategoryId: '1',
        UserId: '1',
        imageFile: null,
        
        // UI-specific fields
        category: '',
        tag: '',
        imagePreview: null,
        url: '',
        pageTitle: '',
        pageDescription: '',
        textBoxContent: '',
        editorContent: null,
        selectedFile: null,
        editingContentId: null,
        editingSectionId: null,
        quizData: null
    },
    successionRates: [
        { certificateId: 1, minRange: 0, maxRange: 60 },
        { certificateId: 2, minRange: 60, maxRange: 100 }
    ],
    sections: [
        {
            id: 'section-1',
            description: '',
            duration: 60,
            hideSection: false,
            mandatory: false,
            title: 'Section 1', // UI field
            isEditing: false,  // UI field
            contents: []
        }
    ],
    activeSection: 'section-1',
    modals: {
        isPageModalVisible: false,
        isTextBoxModalVisible: false,
        isUrlDialogVisible: false,
        isUploadModalVisible: false,
        isQuizModalVisible: false,
        isDropdownOpen: false,
    }
};


// Helper function to convert content types to API format
const getContentTypeNumber = (type) => {
    const typeMap = {
        'page': 0,
        'textBox': 1,
        'url': 3,
        'video': 4,
        'file': 5,
        'quiz': 2,
        'pptx': 6,
    };
    return typeMap[type] || 0;
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setTarget: (state) => {
            switch (state.targetPage) {
                case 'basicInfo':
                    state.target.basicInfo.done = false;
                    state.target.basicInfo.pending = true;
                    state.target.courseContent.pending = false;
                    state.target.courseContent.done = false;
                    state.target.targetGroups.pending = false;
                    state.target.targetGroups.done = false;
                    break;
                case 'courseContent':
                    state.target.basicInfo.done = true;
                    state.target.basicInfo.pending = false;
                    state.target.courseContent.pending = true;
                    state.target.courseContent.done = false;
                    state.target.targetGroups.pending = false;
                    state.target.targetGroups.done = false;
                    break;
                case 'targetGroups':
                    state.target.basicInfo.done = true;
                    state.target.courseContent.done = true;
                    state.target.courseContent.pending = false;
                    state.target.targetGroups.pending = true;
                    state.target.targetGroups.done = false;
                    break;
                default:
                    break;
            }
        },
        setTargetPage: (state, action) => {
            state.targetPage = action.payload;
        },
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
            // Map UI fields to API fields when relevant
            if (action.payload.courseName) {
                state.formData.Name = action.payload.courseName;
            }
            if (action.payload.description) {
                state.formData.Description = action.payload.description;
            }
            if (action.payload.category) {
                state.formData.CategoryId = action.payload.category;
            }
            if (action.payload.verifiedCertificate !== undefined) {
                state.formData.VerifiedCertificate = action.payload.verifiedCertificate;
            }
        },
        setImagePreview: (state, action) => {
            state.formData.imagePreview = action.payload;
        },
        setImageFile: (state, action) => {
            state.formData.imageFile = action.payload;
        },
        setSuccessionRates: (state, action) => {
            state.successionRates = action.payload;
        },
        addSection: (state) => {
            const newSection = {
                id: `section-${Date.now()}`,
                description: '',
                duration: 60,
                hideSection: false,
                mandatory: false,
                title: `Section ${state.sections.length + 1}`,
                isEditing: false,
                contents: []
            };
            state.sections.push(newSection);
            state.activeSection = newSection.id;
        },
        updateSection: (state, action) => {
            const { id, updates } = action.payload;
            const section = state.sections.find(s => s.id === id);
            if (section) {
                Object.assign(section, updates);
            }
        },
        setActiveSection: (state, action) => {
            state.activeSection = action.payload;
        },
        updateSectionTitle: (state, action) => {
            const { id, newTitle } = action.payload;
            const section = state.sections.find(s => s.id === id);
            if (section) {
                section.title = newTitle;
            }
        },
        toggleEditSection: (state, action) => {
            const { id, isEditing } = action.payload;
            const section = state.sections.find(s => s.id === id);
            if (section) {
                section.isEditing = isEditing;
            }
        },
        reorderSections: (state, action) => {
            const { sourceIndex, destinationIndex } = action.payload;
            const sections = Array.from(state.sections);
            const [reorderedItem] = sections.splice(sourceIndex, 1);
            sections.splice(destinationIndex, 0, reorderedItem);
            state.sections = sections;
        },
        addContentToSection: (state, action) => {
            const { sectionId, content } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            if (section) {
                const contentId = `content-${Date.now()}`;
                let formattedContent = {
                    id: contentId,
                    type: getContentTypeNumber(content.type),
                    contentString: '',
                    // Keep original type for UI
                    uiType: content.type
                };

                switch (content.type) {
                    case 'page':
                        formattedContent.contentString = JSON.stringify({
                            title: content.title,
                            description: content.description,
                            content: content.content
                        });
                        break;
                    case 'textBox':
                        formattedContent.contentString = content.content;
                        break;
                    case 'url':
                        formattedContent.contentString = content.url;
                        break;
                    case 'file':
                        formattedContent.ContentFile = content.contentFile;
                        formattedContent.fileName = content.fileName;
                        formattedContent.fileType = content.fileType;
                        formattedContent.icon = content.icon;
                        break;
                    case 'quiz':
                        formattedContent.quizzes = [{
                            duration: content.quiz.duration,
                            canSkip: content.quiz.canSkip,
                            questions: content.quiz.questions.map(q => ({
                                text: q.text,
                                title: q.title,
                                questionRate: q.questionRate,
                                duration: q.duration,
                                hasDuration: true,
                                canSkip: q.canSkip,
                                questionType: parseInt(q.questionType),
                                categories: q.categories || [],
                                options: q.options.map(opt => ({
                                    text: opt.text,
                                    isCorrect: opt.isCorrect,
                                    order: opt.order,
                                    gapText: opt.gapText || opt.text,
                                    category: opt.category || ''
                                }))
                            }))
                        }];
                        // Keep original quiz data for UI
                        formattedContent.quiz = content.quiz;
                        break;
                }

                section.contents.push(formattedContent);
            }
        },
        removeContentFromSection: (state, action) => {
            const { sectionId, contentId } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            if (section) {
                section.contents = section.contents.filter(c => c.id !== contentId);
            }
        },
        reorderContentInSection: (state, action) => {
            const { sectionId, sourceIndex, destinationIndex } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            if (section) {
                const contents = Array.from(section.contents);
                const [movedItem] = contents.splice(sourceIndex, 1);
                contents.splice(destinationIndex, 0, movedItem);
                section.contents = contents;
            }
        },
        setModalVisibility: (state, action) => {
            const { modalName, isVisible } = action.payload;
            state.modals[modalName] = isVisible;
        },
        openContentForEdit: (state, action) => {
            const { sectionId, contentId } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            const content = section?.contents.find(c => c.id === contentId);

            if (content) {
                state.formData.editingContentId = contentId;
                state.formData.editingSectionId = sectionId;

                switch (content.uiType) {
                    case 'textBox':
                        state.formData.textBoxContent = content.contentString;
                        state.modals.isTextBoxModalVisible = true;
                        break;
                    case 'url':
                        state.formData.url = content.contentString;
                        state.modals.isUrlDialogVisible = true;
                        break;
                    case 'page':
                        const pageData = JSON.parse(content.contentString);
                        state.formData.pageTitle = pageData.title;
                        state.formData.pageDescription = pageData.description;
                        state.formData.editorContent = pageData.content;
                        state.modals.isPageModalVisible = true;
                        break;
                    case 'file':
                        state.formData.selectedFile = {
                            file: content.ContentFile,
                            icon: content.icon,
                            name: content.fileName,
                            type: content.fileType
                        };
                        state.modals.isUploadModalVisible = true;
                        break;
                    case 'quiz':
                        state.formData.quizData = content.quiz;
                        state.modals.isQuizModalVisible = true;
                        break;
                }
            }
        },
        updateExistingContent: (state, action) => {
            const { sectionId, contentId, updates } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            const content = section?.contents.find(c => c.id === contentId);

            if (content) {
                switch (content.uiType) {
                    case 'page':
                        content.contentString = JSON.stringify({
                            title: updates.title,
                            description: updates.description,
                            content: updates.content
                        });
                        break;
                    case 'textBox':
                    case 'url':
                        content.contentString = updates.content || updates.url;
                        break;
                    case 'file':
                        Object.assign(content, {
                            ContentFile: updates.contentFile,
                            fileName: updates.fileName,
                            fileType: updates.fileType,
                            icon: updates.icon
                        });
                        break;
                    case 'quiz':
                        content.quizzes = [{
                            duration: updates.quiz.duration,
                            canSkip: updates.quiz.canSkip,
                            questions: updates.quiz.questions
                        }];
                        content.quiz = updates.quiz; // Keep for UI
                        break;
                }
            }

            // Clear editing state
            state.formData.editingContentId = null;
            state.formData.editingSectionId = null;
            state.formData.pageTitle = '';
            state.formData.pageDescription = '';
            state.formData.editorContent = null;
            state.formData.selectedFile = null;
            state.formData.quizData = null;
        },
        clearEditingState: (state) => {
            state.formData.editingContentId = null;
            state.formData.editingSectionId = null;
            state.formData.pageTitle = '';
            state.formData.pageDescription = '';
            state.formData.editorContent = null;
            state.formData.selectedFile = null;
            state.formData.quizData = null;
        }
    }
});

export const {
    setTarget,
    setTargetPage,
    setFormData,
    setImagePreview,
    setImageFile,
    setSuccessionRates,
    addSection,
    updateSection,
    setActiveSection,
    updateSectionTitle,
    toggleEditSection,
    reorderSections,
    addContentToSection,
    removeContentFromSection,
    reorderContentInSection,
    setModalVisibility,
    openContentForEdit,
    updateExistingContent,
    clearEditingState
} = courseSlice.actions;

export default courseSlice.reducer;