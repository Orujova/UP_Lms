import React, { useState, useEffect } from 'react';

const QuizModal = ({
    isVisible,
    onClose,
    onSave,
    isEditing = false,
    initialData = null
}) => {
    const [questions, setQuestions] = useState([]);
    const [questionCounter, setQuestionCounter] = useState(0);

    useEffect(() => {
        if (isEditing && initialData) {
            const transformedQuestions = initialData.questions.map((q, index) => ({
                id: `question-${index}`,
                type: getQuestionType(q.questionType),
                title: q.title,
                points: q.questionRate,
                duration: parseInt(q.duration.split(':')[1]) || 60,
                mandatory: !q.canSkip,
                content: transformQuestionContent(q)
            }));
            setQuestions(transformedQuestions);
            setQuestionCounter(transformedQuestions.length);
        } else {
            setQuestions([]);
            setQuestionCounter(0);
        }
    }, [isEditing, initialData]);

    const getQuestionType = (typeId) => {
        switch (typeId) {
            case 1: return 'choice';
            case 2: return 'multiple';
            case 3: return 'reorder';
            case 4: return 'fillgap';
            case 5: return 'categorize';
            default: return 'choice';
        }
    };

    const transformQuestionContent = (question) => {
        switch (question.questionType) {
            case 1: // Single Choice
                return {
                    question: question.text,
                    multipleAnswers: false,
                    answers: question.options.map(opt => opt.text),
                    correctAnswers: question.options
                        .filter(opt => opt.isCorrect)
                        .map(opt => opt.text)
                };
            case 4: // Fill in the gap
                return {
                    questionText: question.text,
                    correctAnswers: question.options
                        .filter(opt => opt.isCorrect)
                        .map(opt => opt.text),
                    incorrectAnswers: question.options
                        .filter(opt => !opt.isCorrect)
                        .map(opt => opt.text)
                };
            case 5: // Categorize
                const categories = {};
                question.options.forEach(opt => {
                    if (!categories[opt.category]) {
                        categories[opt.category] = [];
                    }
                    categories[opt.category].push(opt.text);
                });
                return {
                    categories: Object.entries(categories).map(([name, answers]) => ({
                        name,
                        answers
                    }))
                };
            case 3: // Reorder
                return {
                    question: question.text,
                    answers: question.options
                        .sort((a, b) => a.order - b.order)
                        .map(opt => opt.text)
                };
            default:
                return {};
        }
    };

    const getQuestionTitle = (type) => {
        const titles = {
            choice: 'Choice Question',
            fillgap: 'Fill-in-the-Blank Question',
            categorize: 'Categorize Question',
            reorder: 'Reorder Question'
        };
        return titles[type] || 'Question';
    };

    const getInitialContent = (type) => {
        switch (type) {
            case 'choice':
                return {
                    question: '',
                    multipleAnswers: false,
                    answers: ['', ''],
                    correctAnswers: []
                };
            case 'fillgap':
                return {
                    questionText: '',
                    correctAnswers: [],
                    incorrectAnswers: []
                };
            case 'categorize':
                return {
                    categories: [{
                        name: '',
                        answers: ['']
                    }]
                };
            case 'reorder':
                return {
                    question: '',
                    answers: ['']
                };
            default:
                return {};
        }
    };

    const addQuestion = (type, e) => {
        e.preventDefault();

        setQuestionCounter(prev => prev + 1);
        const newQuestion = {
            id: `question-${questionCounter}`,
            type,
            title: getQuestionTitle(type),
            points: 1,
            duration: 60,
            mandatory: false,
            content: getInitialContent(type)
        };

        setQuestions(prev => [...prev, newQuestion]);
    };

    const handleSave = (e) => {
        e.preventDefault();

        const formattedQuestions = questions.map(question => {
            let options = [];

            switch (question.type) {
                case 'choice':
                    options = question.content.answers.map((answer, index) => ({
                        text: answer,
                        isCorrect: question.content.correctAnswers.includes(answer),
                        order: index + 1
                    }));
                    break;

                case 'fillgap':
                    options = [
                        ...question.content.correctAnswers.map((answer, index) => ({
                            text: answer,
                            isCorrect: true,
                            order: index + 1,
                            gapText: answer
                        })),
                        ...question.content.incorrectAnswers.map((answer, index) => ({
                            text: answer,
                            isCorrect: false,
                            order: question.content.correctAnswers.length + index + 1,
                            gapText: answer
                        }))
                    ];
                    break;

                case 'categorize':
                    options = question.content.categories.flatMap(category =>
                        category.answers.map((answer, index) => ({
                            text: answer,
                            isCorrect: true,
                            order: index + 1,
                            category: category.name
                        }))
                    );
                    break;

                case 'reorder':
                    options = question.content.answers.map((answer, index) => ({
                        text: answer,
                        isCorrect: true,
                        order: index + 1
                    }));
                    break;
            }

            return {
                text: question.content.question || question.content.questionText || "",
                title: question.title,
                questionRate: question.points,
                duration: `00:${String(question.duration).padStart(2, '0')}:00`,
                hasDuration: true,
                canSkip: !question.mandatory,
                questionType: getQuestionTypeId(question.type),
                categories: question.type === 'categorize'
                    ? question.content.categories.map(c => c.name)
                    : [],
                options: options
            };
        });

        const quizData = {
            duration: "00:01:00", // You might want to calculate total duration
            canSkip: false, // This could be a prop or state
            questions: formattedQuestions
        };

        onSave(quizData);
        onClose();
    };

    const getQuestionTypeId = (type) => {
        switch (type) {
            case 'choice': return 1;
            case 'multiple': return 2;
            case 'reorder': return 3;
            case 'fillgap': return 4;
            case 'categorize': return 5;
            default: return 1;
        }
    };

    const questionTypes = [
        { type: 'choice', label: 'Choice Question' },
        { type: 'fillgap', label: 'Fill-in-the-Blank' },
        { type: 'categorize', label: 'Categorize Question' },
        { type: 'reorder', label: 'Reorder Question' }
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-7xl h-[98vh] flex flex-col">
                <form onSubmit={e => e.preventDefault()}>
                    {/* Header */}
                    <div className="shrink-0 sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {isEditing ? 'Edit Quiz' : 'Create Quiz'}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Question List */}
                        <div className="space-y-4 mb-6">
                            {questions.map((question, index) => (
                                <QuestionBlock
                                    key={question.id}
                                    question={question}
                                    onDelete={(e) => {
                                        e.preventDefault();
                                        setQuestions(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    onChange={(updatedQuestion) => {
                                        setQuestions(prev => prev.map((q, i) =>
                                            i === index ? updatedQuestion : q
                                        ));
                                    }}
                                />
                            ))}
                        </div>

                        {/* Add Question Buttons */}
                        <div className="flex flex-wrap gap-3 mb-6 justify-center">
                            {questionTypes.map(({ type, label }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={(e) => addQuestion(type, e)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={questions.length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditing ? 'Update Quiz' : 'Save Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QuestionBlock = ({ question, onDelete, onChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const updateQuestion = (updates) => {
        onChange({ ...question, ...updates });
    };

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-medium">{question.title}</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {isCollapsed ? 'Expand' : 'Collapse'}
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-4">
                    {/* Question type specific content */}
                    {question.type === 'choice' && (
                        <ChoiceQuestion
                            content={question.content}
                            onChange={(content) => updateQuestion({ content })}
                        />
                    )}

                    {question.type === 'fillgap' && (
                        <FillGapQuestion
                            content={question.content}
                            onChange={(content) => updateQuestion({ content })}
                        />
                    )}
                    {question.type === 'categorize' && (
                        <CategorizeQuestion
                            content={question.content}
                            onChange={(content) => updateQuestion({ content })}
                        />
                    )}
                    {question.type === 'reorder' && (
                        <ReorderQuestion
                            content={question.content}
                            onChange={(content) => updateQuestion({ content })}
                        />
                    )}

                    <div className="mt-4 flex gap-4 items-center">
                        <div className="flex items-center">
                            <label className="mr-2">Points:</label>
                            <input
                                type="number"
                                value={question.points}
                                onChange={(e) => updateQuestion({ points: parseInt(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded"
                                min="1"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="mr-2">Duration (seconds):</label>
                            <input
                                type="number"
                                value={question.duration}
                                onChange={(e) => updateQuestion({ duration: parseInt(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded"
                                min="1"
                            />
                        </div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={question.mandatory}
                                onChange={(e) => updateQuestion({ mandatory: e.target.checked })}
                                className="mr-2"
                            />
                            Mandatory
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

const ChoiceQuestion = ({ content, onChange }) => {
    const updateContent = (updates) => {
        onChange({ ...content, ...updates });
    };

    const addAnswer = (e) => {
        e.preventDefault();
        updateContent({ answers: [...content.answers, ''] });
    };

    const updateAnswer = (index, value) => {
        const newAnswers = [...content.answers];
        newAnswers[index] = value;
        updateContent({ answers: newAnswers });
    };

    const toggleCorrectAnswer = (e, index) => {
        e.preventDefault();
        const answer = content.answers[index];
        let newCorrectAnswers;

        if (content.multipleAnswers) {
            newCorrectAnswers = content.correctAnswers.includes(answer)
                ? content.correctAnswers.filter(a => a !== answer)
                : [...content.correctAnswers, answer];
        } else {
            newCorrectAnswers = [answer];
        }

        updateContent({ correctAnswers: newCorrectAnswers });
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                value={content.question}
                onChange={(e) => updateContent({ question: e.target.value })}
                placeholder="Enter your question"
                className="w-full px-3 py-2 border rounded-lg"
            />

            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={content.multipleAnswers}
                    onChange={(e) => updateContent({ multipleAnswers: e.target.checked, correctAnswers: [] })}
                    className="mr-2"
                />
                Multiple answers allowed
            </label>

            <div className="space-y-2">
                {content.answers.map((answer, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-2 p-2 border rounded-lg
                      ${content.correctAnswers.includes(answer) ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => updateAnswer(index, e.target.value)}
                            placeholder="Enter answer"
                            className="flex-1 px-2 py-1"
                        />
                        <button
                            type="button"
                            onClick={(e) => toggleCorrectAnswer(e, index)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            {content.correctAnswers.includes(answer) ? 'Correct' : 'Mark Correct'}
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addAnswer}
                    className="text-blue-600 hover:text-blue-700"
                >
                    + Add Answer
                </button>
            </div>
        </div>
    );
};

const FillGapQuestion = ({ content, onChange }) => {
    const updateContent = (updates) => {
        onChange({ ...content, ...updates });
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        // Convert "__" to blanks and track answers
        const blanks = (text.match(/__/g) || []).length;
        const correctAnswers = content.correctAnswers.slice(0, blanks);
        while (correctAnswers.length < blanks) {
            correctAnswers.push('');
        }

        updateContent({
            questionText: text,
            correctAnswers
        });
    };

    const addIncorrectAnswer = (e) => {
        e.preventDefault();
        const newAnswer = e.target.elements.incorrectAnswer?.value || '';
        if (newAnswer.trim()) {
            updateContent({
                incorrectAnswers: [...content.incorrectAnswers, newAnswer.trim()]
            });
            e.target.elements.incorrectAnswer.value = '';
        }
    };

    const removeIncorrectAnswer = (index) => {
        updateContent({
            incorrectAnswers: content.incorrectAnswers.filter((_, i) => i !== index)
        });
    };

    const updateCorrectAnswer = (index, value) => {
        const newAnswers = [...content.correctAnswers];
        newAnswers[index] = value;
        updateContent({ correctAnswers: newAnswers });
    };

    return (
        <div className="space-y-6">
            {/* Question Text Area */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text (Use "__" to create blanks)
                </label>
                <textarea
                    value={content.questionText}
                    onChange={handleTextChange}
                    placeholder="Enter your question text with __ for blanks. Example: The capital of France is __."
                    className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                />
            </div>

            {/* Correct Answers Section */}
            {content.correctAnswers.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Correct Answers</h4>
                    <div className="space-y-2">
                        {content.correctAnswers.map((answer, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Blank {index + 1}:</span>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                                    placeholder="Enter correct answer"
                                    className="flex-1 px-3 py-2 border rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Incorrect Answers Section */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Incorrect Answers (Optional)</h4>
                <form onSubmit={addIncorrectAnswer} className="flex gap-2">
                    <input
                        type="text"
                        name="incorrectAnswer"
                        placeholder="Enter an incorrect answer"
                        className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add
                    </button>
                </form>

                <div className="space-y-2">
                    {content.incorrectAnswers.map((answer, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                            <span>{answer}</span>
                            <button
                                type="button"
                                onClick={() => removeIncorrectAnswer(index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CategorizeQuestion = ({ content, onChange }) => {
    const updateContent = (updates) => {
        onChange({ ...content, ...updates });
    };

    const addCategory = () => {
        updateContent({
            categories: [...content.categories, { name: '', answers: [''] }]
        });
    };

    const removeCategory = (categoryIndex) => {
        updateContent({
            categories: content.categories.filter((_, index) => index !== categoryIndex)
        });
    };

    const updateCategoryName = (categoryIndex, name) => {
        const newCategories = [...content.categories];
        newCategories[categoryIndex] = { ...newCategories[categoryIndex], name };
        updateContent({ categories: newCategories });
    };

    const addAnswer = (categoryIndex) => {
        const newCategories = [...content.categories];
        newCategories[categoryIndex].answers.push('');
        updateContent({ categories: newCategories });
    };

    const removeAnswer = (categoryIndex, answerIndex) => {
        const newCategories = [...content.categories];
        newCategories[categoryIndex].answers = newCategories[categoryIndex].answers
            .filter((_, index) => index !== answerIndex);
        updateContent({ categories: newCategories });
    };

    const updateAnswer = (categoryIndex, answerIndex, value) => {
        const newCategories = [...content.categories];
        newCategories[categoryIndex].answers[answerIndex] = value;
        updateContent({ categories: newCategories });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.categories.map((category, categoryIndex) => (
                    <div
                        key={categoryIndex}
                        className="border rounded-lg p-4 bg-gray-50 space-y-4"
                    >
                        {/* Category Header */}
                        <div className="flex items-center justify-between gap-2">
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                                placeholder="Category name"
                                className="flex-1 px-3 py-2 border rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeCategory(categoryIndex)}
                                className="text-red-600 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Answers List */}
                        <div className="space-y-2">
                            {category.answers.map((answer, answerIndex) => (
                                <div key={answerIndex} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => updateAnswer(categoryIndex, answerIndex, e.target.value)}
                                        placeholder="Answer"
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAnswer(categoryIndex, answerIndex)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addAnswer(categoryIndex)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                + Add Answer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Add Category
            </button>
        </div>
    );
};

const ReorderQuestion = ({ content, onChange }) => {
    const updateContent = (updates) => {
        onChange({ ...content, ...updates });
    };

    const addAnswer = () => {
        updateContent({
            answers: [...content.answers, '']
        });
    };

    const removeAnswer = (index) => {
        updateContent({
            answers: content.answers.filter((_, i) => i !== index)
        });
    };

    const moveAnswer = (fromIndex, toIndex) => {
        const newAnswers = [...content.answers];
        const [movedItem] = newAnswers.splice(fromIndex, 1);
        newAnswers.splice(toIndex, 0, movedItem);
        updateContent({ answers: newAnswers });
    };

    const updateAnswer = (index, value) => {
        const newAnswers = [...content.answers];
        newAnswers[index] = value;
        updateContent({ answers: newAnswers });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                </label>
                <input
                    type="text"
                    value={content.question}
                    onChange={(e) => updateContent({ question: e.target.value })}
                    placeholder="Enter your question"
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Answers (in correct order)
                </label>
                {content.answers.map((answer, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 bg-white p-2 border rounded-lg"
                    >
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => index > 0 && moveAnswer(index, index - 1)}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                disabled={index === 0}
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                onClick={() => index < content.answers.length - 1 && moveAnswer(index, index + 1)}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                disabled={index === content.answers.length - 1}
                            >
                                ↓
                            </button>
                        </div>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => updateAnswer(index, e.target.value)}
                            placeholder={`Answer ${index + 1}`}
                            className="flex-1 px-3 py-2 border rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => removeAnswer(index)}
                            className="text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addAnswer}
                    className="text-blue-600 hover:text-blue-700"
                >
                    + Add Answer
                </button>
            </div>

            <div className="text-sm text-gray-500">
                Use the up and down arrows to set the correct order of answers.
            </div>
        </div>
    );
};


export default QuizModal;