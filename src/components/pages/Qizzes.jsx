import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import MultilingualInput from '../common/MultiLingualInput';
import { quizzesAPI } from '../../services/api';
import { DEFAULT_MULTILINGUAL } from '../../utils/constants';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [formData, setFormData] = useState({
    question: { ...DEFAULT_MULTILINGUAL },
    options: [
      { ...DEFAULT_MULTILINGUAL },
      { ...DEFAULT_MULTILINGUAL },
      { ...DEFAULT_MULTILINGUAL },
      { ...DEFAULT_MULTILINGUAL }
    ],
    correctAnswer: { ...DEFAULT_MULTILINGUAL }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAllLanguages();
      setQuizzes(response.data.quizzes || []);
      console.log("Res",response.data);
      
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedQuiz(null);
    setFormData({
      question: { ...DEFAULT_MULTILINGUAL },
      options: [
        { ...DEFAULT_MULTILINGUAL },
        { ...DEFAULT_MULTILINGUAL },
        { ...DEFAULT_MULTILINGUAL },
        { ...DEFAULT_MULTILINGUAL }
      ],
      correctAnswer: { ...DEFAULT_MULTILINGUAL }
    });
    setModalOpen(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      question: quiz.question || { ...DEFAULT_MULTILINGUAL },
      options: quiz.options || [{ ...DEFAULT_MULTILINGUAL }],
      correctAnswer: quiz.correctAnswer || { ...DEFAULT_MULTILINGUAL }
    });
    setModalOpen(true);
  };

  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setViewModalOpen(true);
  };

  const handleDelete = async (quiz) => {
    if (window.confirm(`Are you sure you want to delete this quiz?`)) {
      try {
        await quizzesAPI.delete(quiz._id);
        fetchQuizzes();
        alert('Quiz deleted successfully');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedQuiz) {
        await quizzesAPI.update(selectedQuiz._id, formData);
        alert('Quiz updated successfully');
      } else {
        await quizzesAPI.create(formData);
        alert('Quiz created successfully');
      }
      setModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { ...DEFAULT_MULTILINGUAL }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const columns = [
    { key: 'question', label: 'Question', render: (value) => value?.en || '-' },
    { key: 'options', label: 'Options', render: (value) => `${value?.length || 0} options` },
    { key: 'correctAnswer', label: 'Correct Answer', render: (value) => value?.en || '-' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quizzes</h1>
        <p className="text-gray-600 mt-1">Manage quiz questions</p>
      </div>

      <DataTable
        data={quizzes}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedQuiz ? 'Edit Quiz' : 'Add New Quiz'}
        size="xlarge"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <MultilingualInput
            label="Question"
            value={formData.question}
            onChange={(value) => setFormData({ ...formData, question: value })}
            required
            placeholder="Enter question"
          />

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Answer Options <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                + Add Option
              </button>
            </div>
            {formData.options.map((option, index) => (
              <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Option {index + 1}</span>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <MultilingualInput
                  label=""
                  value={option}
                  onChange={(value) => handleOptionChange(index, value)}
                  placeholder={`Enter option ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <MultilingualInput
            label="Correct Answer"
            value={formData.correctAnswer}
            onChange={(value) => setFormData({ ...formData, correctAnswer: value })}
            required
            placeholder="Enter correct answer"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : selectedQuiz ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Quiz Details"
        size="large"
      >
        {selectedQuiz && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Question</h3>
              <p className="text-lg font-medium">{selectedQuiz.question?.en}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Correct Answer</h3>
              <p className="text-lg font-medium text-green-600">{selectedQuiz.correctAnswer?.en}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quizzes;