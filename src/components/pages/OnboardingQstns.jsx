import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { Plus, X } from "lucide-react";
import { onBoardingAPI } from "../../services/api";
import MultilingualInput from "../common/MultiLingualInput";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const OnboardingQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [formData, setFormData] = useState({
    questionText: { ...DEFAULT_MULTILINGUAL },
    options: [
      { text: { ...DEFAULT_MULTILINGUAL } },
      { text: { ...DEFAULT_MULTILINGUAL } },
    ],
  });

  const [saving, setSaving] = useState(false);

  const normalize = (val) => {
    if (!val) return { ...DEFAULT_MULTILINGUAL };
    if (typeof val === "string") return { en: val };
    return val;
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await onBoardingAPI.getAllLanguages();
      setQuestions(response.data.questions || []);
      console.log(response.data);
      
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setFormData({
      questionText: { ...DEFAULT_MULTILINGUAL },
      options: [
        { text: { ...DEFAULT_MULTILINGUAL } },
        { text: { ...DEFAULT_MULTILINGUAL } },
      ],
    });
    setModalOpen(true);
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      questionText: normalize(question.questionText),
      options:
        question.options?.length > 0
          ? question.options.map((opt) => ({
              text: normalize(opt.text),
            }))
          : [
              { text: { ...DEFAULT_MULTILINGUAL } },
              { text: { ...DEFAULT_MULTILINGUAL } },
            ],
    });
    setModalOpen(true);
  };

  const handleView = (question) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };

  const handleDelete = async (question) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await onBoardingAPI.delete(question._id);
        fetchQuestions();
        alert("Question deleted successfully");
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Failed to delete question");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = formData.options.filter(
      (opt) => opt.text.en?.trim() || opt.text.hi?.trim() || opt.text.ta?.trim()
    );

    if (!formData.questionText.en.trim()) {
      alert("Please enter a question (English is required)");
      return;
    }

    if (validOptions.length < 2) {
      alert("Minimum 2 options required");
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        questionText: formData.questionText,
        options: validOptions,
      };

      if (selectedQuestion) {
        await onBoardingAPI.update(selectedQuestion._id, submitData);
        alert("Question updated successfully");
      } else {
        await onBoardingAPI.create(submitData);
        alert("Question created successfully");
      }

      setModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      alert(error.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index].text = value;
    setFormData({ ...formData, options: updated });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: { ...DEFAULT_MULTILINGUAL } }],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert("At least 2 options required");
      return;
    }
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const columns = [
    {
      key: "questionText",
      label: "Question",
      render: (value) => <p className="font-medium">{value.en || value}</p>,
    },
    {
      key: "options",
      label: "Options",
      render: (value) => `${value?.length || 0} options`,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Onboarding Questions</h1>

      <DataTable
        data={questions}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedQuestion ? "Edit Question" : "Add New Question"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multilingual Question */}
          <MultilingualInput
            label="Question Text"
            value={formData.questionText}
            onChange={(v) => setFormData({ ...formData, questionText: v })}
          />

          {/* Multilingual Options */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm font-semibold">
                Options (Minimum 2 required)
              </label>
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {formData.options.map((opt, index) => (
                <div key={index} className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-semibold">Option {index + 1}</span>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <MultilingualInput
                    label="Option Text"
                    value={opt.text}
                    onChange={(v) => handleOptionChange(index, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              {saving ? "Saving..." : selectedQuestion ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Question Details"
        size="large"
      >
        {selectedQuestion && (
          <div className="space-y-4">
            <h3 className="font-semibold">Question</h3>
            <p className="text-lg font-medium">
              {selectedQuestion.questionText?.en}
            </p>

            <h3 className="font-semibold mt-4">Options</h3>
            <ul className="list-disc pl-5">
              {selectedQuestion.options?.map((o, i) => (
                <li key={i} className="font-medium">
                  {o.text?.en}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OnboardingQuestions;
