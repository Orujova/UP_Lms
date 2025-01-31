import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    target: {
        basicInfo: { pending: true, done: false },
        courseContent: { pending: false, done: false },
        targetGroups: { pending: false, done: false },
    },
    targetPage: 'basicInfo', // Page navigation management
    formData: {
        courseName: '',
        category: '',
        description: '',
        tag: '',
        duration: '',
        verifiedCertificate: false,
        coverImage: null,
        imagePreview: null,
        url: '',
        pageTitle: '',
        pageDescription: '',
        textBoxContent: '',
        imageFile: null,
        pageTitle: '',
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
            title: 'Section 1',
            description: '',
            duration: 0,
            hideSection: false,
            mandatory: false,
            isEditing: false,
            contents: [],
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
        },
        setImagePreview: (state, action) => {
            state.formData.imagePreview = action.payload;
        },
        setCoverImage: (state, action) => {
            state.formData.coverImage = action.payload;
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
                title: `Section ${state.sections.length + 1}`,
                description: '',
                duration: 0,
                hideSection: false,
                mandatory: false,
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
                content.id = `content-${Date.now()}`;
                section.contents.push(content);
            }
        },
        updateContentInSection: (state, action) => {
            const { sectionId, contentId, updates } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            if (section) {
                const content = section.contents.find(c => c.id === contentId);
                if (content) {
                    Object.assign(content, updates);
                }
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
                const updatedItems = Array.from(section.contents);
                const [movedItem] = updatedItems.splice(sourceIndex, 1);
                updatedItems.splice(destinationIndex, 0, movedItem);
                section.contents = updatedItems;
            };
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
                // Set common editing state
                state.formData.editingContentId = contentId;
                state.formData.editingSectionId = sectionId;

                switch (content.type) {
                    case 'textBox':
                        state.formData.textBoxContent = content.content;
                        state.modals.isTextBoxModalVisible = true;
                        break;
                    case 'url':
                        state.formData.url = content.url;
                        state.modals.isUrlDialogVisible = true;
                        break;
                    case 'page':
                        state.formData.pageTitle = content.title;
                        state.formData.pageDescription = content.description;
                        state.formData.editorContent = content.content;
                        state.modals.isPageModalVisible = true;
                        break;
                    case 'file':
                        state.formData.selectedFile = {
                            file: content.contentFile,
                            icon: content.icon,
                            name: content.fileName,
                            type: content.fileType
                        };
                        state.modals.isUploadModalVisible = true;
                        break;
                    case 'quiz':
                        state.formData.quizData = content.quiz;  // Store the quiz data
                        state.modals.isQuizModalVisible = true;
                        break;
                }
            }
        },
        updateExistingContent: (state, action) => {
            const { sectionId, contentId, updates } = action.payload;
            const section = state.sections.find(s => s.id === sectionId);
            const content = section?.contents.find(c => c.id === contentId);

            if (section) {
                const contentIndex = section.contents.findIndex(c => c.id === contentId);
                if (contentIndex !== -1) {
                    section.contents[contentIndex] = {
                        ...section.contents[contentIndex],
                        ...updates
                    };
                }
            }

            if (content) {
                Object.assign(content, updates);
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
    setCoverImage,
    setImageFile,
    setSuccessionRates,
    addSection,
    updateSection,
    setActiveSection,
    updateSectionTitle,
    toggleEditSection,
    reorderSections,
    addContentToSection,
    updateContentInSection,
    removeContentFromSection,
    reorderContentInSection,
    setModalVisibility,
    openContentForEdit,
    updateExistingContent,
    clearEditingState
} = courseSlice.actions;

export default courseSlice.reducer;