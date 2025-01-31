import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://bravoadmin.uplms.org/api/';

const headers = {
    'accept': 'application/json',
};

const DEBUG = true;

const logDebug = (action, data) => {
    if (DEBUG) {
        console.group(`Course API - ${action}`);
        console.groupEnd();
    }
};

export const fetchCourse = async () => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapınız.');
        }

        const response = await axios.get(`${API_URL}Course`, {
            headers: {
                ...headers,
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCourse = async (courseState) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapınız.');
        }

        logDebug('Creating Course - Initial State', courseState);

        const formData = new FormData();
        formData.append('Name', courseState.formData.Name);
        formData.append('Description', courseState.formData.Description);
        formData.append('TargetGroupId', courseState.formData.TargetGroupId);
        formData.append('VerifiedCertificate', courseState.formData.VerifiedCertificate.toString());
        formData.append('Duration', courseState.formData.Duration);
        formData.append('CategoryId', courseState.formData.CategoryId);
        formData.append('UserId', courseState.formData.UserId);

        if (courseState.formData.imageFile) {
            formData.append('imageFile', courseState.formData.imageFile);
        }

        courseState.successionRates.forEach((rate, index) => {
            formData.append(`SuccessionRates[${index}][certificateId]`, rate.certificateId.toString());
            formData.append(`SuccessionRates[${index}][minRange]`, rate.minRange.toString());
            formData.append(`SuccessionRates[${index}][maxRange]`, rate.maxRange.toString());
        });

        courseState.sections.forEach((section, sectionIndex) => {
            formData.append(`Sections[${sectionIndex}][description]`, 'section description');
            formData.append(`Sections[${sectionIndex}][duration]`, section.duration.toString());
            formData.append(`Sections[${sectionIndex}][hideSection]`, section.hideSection.toString());
            formData.append(`Sections[${sectionIndex}][mandatory]`, section.mandatory.toString());

            section.contents.forEach((content, contentIndex) => {
                formData.append(`Sections[${sectionIndex}][contents][${contentIndex}][type]`, content.type.toString());
                if (content.contentString) {
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}].contentString`, content.contentString);
                }
                if (content.ContentFile) {
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}].ContentFile`, content.ContentFile);
                } else {
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}].ContentFile`, null);
                }

                if (content.type === 2 && content.quizzes && content.quizzes[0]) {
                    const quiz = content.quizzes[0];
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}][quizzes][0][duration]`, quiz.duration);
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}][quizzes][0][canSkip]`, quiz.canSkip.toString());
                    formData.append(`Sections[${sectionIndex}].Contents[${contentIndex}].contentString`, 'Quiz');

                    quiz.questions.forEach((question, questionIndex) => {
                        const basePath = `Sections[${sectionIndex}].Contents[${contentIndex}][quizzes][0][questions][${questionIndex}]`;
                        formData.append(`${basePath}[text]`, question.text);
                        formData.append(`${basePath}[title]`, question.title);
                        formData.append(`${basePath}[questionRate]`, question.questionRate.toString());
                        formData.append(`${basePath}[duration]`, question.duration);
                        formData.append(`${basePath}[hasDuration]`, question.hasDuration.toString());
                        formData.append(`${basePath}[canSkip]`, question.canSkip.toString());
                        formData.append(`${basePath}[questionType]`, question.questionType.toString());

                        if (question.categories) {
                            question.categories.forEach((category, categoryIndex) => {
                                formData.append(`${basePath}[categories][${categoryIndex}]`, category);
                            });
                        }

                        question.options.forEach((option, optionIndex) => {
                            const optionPath = `${basePath}[options][${optionIndex}]`;
                            formData.append(`${optionPath}[text]`, option.text);
                            formData.append(`${optionPath}[isCorrect]`, option.isCorrect.toString());
                            formData.append(`${optionPath}[order]`, option.order.toString());

                            if (option.gapText) {
                                formData.append(`${optionPath}[gapText]`, option.gapText);
                            }
                            if (option.category) {
                                formData.append(`${optionPath}[category]`, option.category);
                            }
                        });
                    });
                }
            });
        });

        if (DEBUG) {
            console.group('FormData Entries:');
            for (let pair of formData.entries()) {
            }
            console.groupEnd();
        }

        const response = await axios.post(`${API_URL}Course`, formData, {
            headers: {
                ...headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        logDebug('API Response', response.data);
        return response.data;

    } catch (error) {
        logDebug('API Error', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};