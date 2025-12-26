import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { languagesAPI, nativeLang, questionsAPI } from "../../services/api";

const LanguagesPage = () => {
  /* -------------------------------------------------------------------------- */
  /*                           APP LANGUAGES SECTION                            */
  /* -------------------------------------------------------------------------- */

  const [languages, setLanguages] = useState([]);
  const [langLoading, setLangLoading] = useState(true);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langViewModalOpen, setLangViewModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [langFormData, setLangFormData] = useState({
    code: "",
    name: "",
    isActive: true,
  });

  const [langSaving, setLangSaving] = useState(false);

  useEffect(() => {
    fetchLanguages();
    fetchNativeLanguages();
    fetchQuestions();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await languagesAPI.getAll();
      setLanguages(response.data.languages || []);
    } catch (error) {
      alert("Failed to load languages");
    } finally {
      setLangLoading(false);
    }
  };

  const openAddLang = () => {
    setSelectedLanguage(null);
    setLangFormData({
      code: "",
      name: "",
      isActive: true,
    });
    setLangModalOpen(true);
  };

  const openEditLang = (lang) => {
    setSelectedLanguage(lang);
    setLangFormData({
      code: lang.code,
      name: lang.name,
      isActive: lang.isActive,
    });
    setLangModalOpen(true);
  };

  const openViewLang = (lang) => {
    setSelectedLanguage(lang);
    setLangViewModalOpen(true);
  };

  const deleteLang = async (lang) => {
    if (!window.confirm("Are you sure you want to delete this language?")) return;
    try {
      await languagesAPI.delete(lang._id);
      fetchLanguages();
      alert("Language deleted");
    } catch (err) {
      alert("Failed to delete language");
    }
  };

  const submitLang = async (e) => {
    e.preventDefault();

    if (!langFormData.code.trim()) return alert("Enter language code");
    if (!langFormData.name.trim()) return alert("Enter language name");

    const codeRegex = /^[a-z]{2,3}$/;
    if (!codeRegex.test(langFormData.code)) {
      return alert("Language code must be 2–3 lowercase letters");
    }

    setLangSaving(true);

    try {
      const payload = {
        code: langFormData.code.toLowerCase(),
        name: langFormData.name,
        isActive: langFormData.isActive,
      };

      if (selectedLanguage) {
        await languagesAPI.update(selectedLanguage._id, payload);
        alert("Language updated");
      } else {
        await languagesAPI.create(payload);
        alert("Language created");
      }

      setLangModalOpen(false);
      fetchLanguages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setLangSaving(false);
    }
  };

  const languageColumns = [
    {
      key: "code",
      label: "Code",
      render: (v) => (
        <span className="font-mono uppercase px-3 py-1 rounded bg-cyan-50 text-cyan-600 font-bold">
          {v}
        </span>
      ),
    },
    {
      key: "name",
      label: "Language",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (v) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {v ? "✓ Active" : "✕ Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => new Date(v).toLocaleDateString(),
    },
  ];

  /* -------------------------------------------------------------------------- */
  /*                          NATIVE LANGUAGES SECTION                          */
  /* -------------------------------------------------------------------------- */

  const [nativeLanguages, setNativeLanguages] = useState([]);
  const [nativeLoading, setNativeLoading] = useState(true);
  const [nativeModalOpen, setNativeModalOpen] = useState(false);
  const [nativeViewModalOpen, setNativeViewModalOpen] = useState(false);
  const [selectedNative, setSelectedNative] = useState(null);

  const [nativeFormData, setNativeFormData] = useState({
    code: "",
    name: "",
    isActive: true,
  });

  const [nativeSaving, setNativeSaving] = useState(false);

  const fetchNativeLanguages = async () => {
    try {
      const res = await nativeLang.getAll();
      setNativeLanguages(res.data.languages || []);
    } catch (err) {
      alert("Failed to load native languages");
    } finally {
      setNativeLoading(false);
    }
  };

  const openAddNative = () => {
    setSelectedNative(null);
    setNativeFormData({
      code: "",
      name: "",
      isActive: true,
    });
    setNativeModalOpen(true);
  };

  const openEditNative = (lang) => {
    setSelectedNative(lang);
    setNativeFormData({
      code: lang.code,
      name: lang.name,
      isActive: lang.isActive,
    });
    setNativeModalOpen(true);
  };

  const openViewNative = (lang) => {
    setSelectedNative(lang);
    setNativeViewModalOpen(true);
  };

  const deleteNative = async (lang) => {
    if (!window.confirm("Delete this native language?")) return;
    try {
      await nativeLang.delete(lang._id);
      fetchNativeLanguages();
      alert("Deleted");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const submitNative = async (e) => {
    e.preventDefault();

    if (!nativeFormData.code.trim()) return alert("Enter language code");
    if (!nativeFormData.name.trim()) return alert("Enter language name");

    const codeRegex = /^[a-z]{2,3}$/;
    if (!codeRegex.test(nativeFormData.code)) {
      return alert("Code must be 2–3 lowercase letters");
    }

    setNativeSaving(true);

    try {
      const payload = {
        code: nativeFormData.code.toLowerCase(),
        name: nativeFormData.name,
        isActive: nativeFormData.isActive,
      };

      if (selectedNative) {
        await nativeLang.update(selectedNative._id, payload);
        alert("Updated");
      } else {
        await nativeLang.create(payload);
        alert("Created");
      }

      setNativeModalOpen(false);
      fetchNativeLanguages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setNativeSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              QUESTIONS SECTION                              */
  /* -------------------------------------------------------------------------- */

  const EMPTY_TRANSLATIONS = {
    en: "",
    ml: "",
    hi: "",
    ta: "",
    te: "",
    kn: "",
  };

  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionModal, setQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionViewModal, setQuestionViewModal] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    langType: "native",
    question: EMPTY_TRANSLATIONS,
  });

  const fetchQuestions = async () => {
    try {
      const res = await questionsAPI.getAll();
      setQuestions(res.data.questions || []);
    } catch (err) {
      alert("Failed to load questions");
    } finally {
      setQuestionLoading(false);
    }
  };

  const openAddQuestion = () => {
    setSelectedQuestion(null);
    setQuestionForm({
      langType: "native",
      question: EMPTY_TRANSLATIONS,
    });
    setQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setSelectedQuestion(q);
    setQuestionForm(q);
    setQuestionModal(true);
  };

  const openViewQuestion = (q) => {
    setSelectedQuestion(q);
    setQuestionViewModal(true);
  };

  const deleteQuestion = async (q) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await questionsAPI.delete(q._id);
      fetchQuestions();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    try {
      if (selectedQuestion) {
        await questionsAPI.update(selectedQuestion._id, questionForm);
        alert("Question updated");
      } else {
        await questionsAPI.create(questionForm);
        alert("Question created");
      }
      setQuestionModal(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const questionColumns = [
    {
      key: "langType",
      label: "Type",
      render: (v) => (
        <span className="px-3 py-1 rounded bg-blue-100 text-blue-700">
          {v}
        </span>
      ),
    },
    {
      key: "question",
      label: "EN Question",
      render: (q) => q.en || "-",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => new Date(v).toLocaleDateString(),
    },
  ];

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-20">
      {/* ------------------------------ LANGUAGES ------------------------------ */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Learning Languages</h1>
        <p className="text-gray-600 mt-1">Manage Learning languages for the Users</p>
      </div>

      <DataTable
        data={languages}
        columns={languageColumns}
        onAdd={openAddLang}
        onEdit={openEditLang}
        onView={openViewLang}
        onDelete={deleteLang}
        loading={langLoading}
      />

      {/* App Language Add/Edit Modal */}
      <Modal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        title={selectedLanguage ? "Edit Language" : "Add Language"}
      >
        <form onSubmit={submitLang} className="space-y-6">
          <div>
            <label className="text-sm font-semibold">Code</label>
            <input
              type="text"
              value={langFormData.code}
              disabled={!!selectedLanguage}
              maxLength={3}
              pattern="[a-z]{2,3}"
              className="w-full px-4 py-2 border rounded"
              onChange={(e) =>
                setLangFormData({
                  ...langFormData,
                  code: e.target.value.toLowerCase(),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              type="text"
              value={langFormData.name}
              className="w-full px-4 py-2 border rounded"
              onChange={(e) =>
                setLangFormData({
                  ...langFormData,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={langFormData.isActive}
              onChange={(e) =>
                setLangFormData({
                  ...langFormData,
                  isActive: e.target.checked,
                })
              }
            />
            <span>Active</span>
          </div>

          <button
            className="w-full py-2 bg-cyan-600 text-white rounded"
            type="submit"
          >
            {langSaving ? "Saving..." : selectedLanguage ? "Update" : "Create"}
          </button>
        </form>
      </Modal>

      {/* App Language View */}
      <Modal
        isOpen={langViewModalOpen}
        onClose={() => setLangViewModalOpen(false)}
        title="Language Details"
      >
        {selectedLanguage && (
          <div className="space-y-3">
            <p>
              <strong>Code:</strong> {selectedLanguage.code}
            </p>
            <p>
              <strong>Name:</strong> {selectedLanguage.name}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedLanguage.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        )}
      </Modal>

      {/* --------------------------- NATIVE LANGUAGES --------------------------- */}
      <div>
        <h2 className="text-2xl font-bold">Native Languages</h2>
        <p className="text-gray-600">
          Manage the native languages used inside onboarding
        </p>
      </div>

      <DataTable
        data={nativeLanguages}
        columns={languageColumns}
        onAdd={openAddNative}
        onEdit={openEditNative}
        onView={openViewNative}
        onDelete={deleteNative}
        loading={nativeLoading}
      />

      {/* Native Add/Edit Modal */}
      <Modal
        isOpen={nativeModalOpen}
        onClose={() => setNativeModalOpen(false)}
        title={selectedNative ? "Edit Native Language" : "Add Native Language"}
      >
        <form onSubmit={submitNative} className="space-y-6">
          <div>
            <label className="text-sm font-semibold">Code</label>
            <input
              type="text"
              value={nativeFormData.code}
              disabled={!!selectedNative}
              maxLength={3}
              pattern="[a-z]{2,3}"
              className="w-full px-4 py-2 border rounded"
              onChange={(e) =>
                setNativeFormData({
                  ...nativeFormData,
                  code: e.target.value.toLowerCase(),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              type="text"
              value={nativeFormData.name}
              className="w-full px-4 py-2 border rounded"
              onChange={(e) =>
                setNativeFormData({
                  ...nativeFormData,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={nativeFormData.isActive}
              onChange={(e) =>
                setNativeFormData({
                  ...nativeFormData,
                  isActive: e.target.checked,
                })
              }
            />
            <span>Active</span>
          </div>

          <button
            className="w-full py-2 bg-blue-600 text-white rounded"
            type="submit"
          >
            {nativeSaving ? "Saving..." : selectedNative ? "Update" : "Create"}
          </button>
        </form>
      </Modal>

      {/* Native View */}
      <Modal
        isOpen={nativeViewModalOpen}
        onClose={() => setNativeViewModalOpen(false)}
        title="Native Language Details"
      >
        {selectedNative && (
          <div className="space-y-3">
            <p>
              <strong>Code:</strong> {selectedNative.code}
            </p>
            <p>
              <strong>Name:</strong> {selectedNative.name}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedNative.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        )}
      </Modal>

      {/* --------------------------- QUESTIONS SECTION --------------------------- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Onboarding Questions
        </h2>
        <p className="text-gray-600">Manage onboarding questions</p>
      </div>

      <DataTable
        data={questions}
        columns={questionColumns}
        onAdd={openAddQuestion}
        onEdit={openEditQuestion}
        onView={openViewQuestion}
        onDelete={deleteQuestion}
        loading={questionLoading}
      />

      {/* Add/Edit Question */}
      <Modal
        isOpen={questionModal}
        onClose={() => setQuestionModal(false)}
        title={selectedQuestion ? "Edit Question" : "Add Question"}
        size="large"
      >
        <form onSubmit={submitQuestion} className="space-y-6">
          <div>
            <label className="font-semibold">Question Type</label>
            <select
              className="w-full px-4 py-2 border rounded"
              value={questionForm.langType}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, langType: e.target.value })
              }
            >
              <option value="native">Native</option>
              <option value="preferred">Preferred</option>
            </select>
          </div>

          {/* Translations */}
          {Object.keys(EMPTY_TRANSLATIONS).map((lang) => (
            <div key={lang}>
              <label className="uppercase text-sm font-semibold">
                {lang}
              </label>
              <input
                type="text"
                value={questionForm.question[lang]}
                placeholder={`Enter question in ${lang.toUpperCase()}`}
                className="w-full px-4 py-2 border rounded"
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question: {
                      ...questionForm.question,
                      [lang]: e.target.value,
                    },
                  })
                }
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            {selectedQuestion ? "Update" : "Create"}
          </button>
        </form>
      </Modal>

      {/* View Question */}
      <Modal
        isOpen={questionViewModal}
        onClose={() => setQuestionViewModal(false)}
        title="Question Details"
        size="large"
      >
        {selectedQuestion && (
          <div className="space-y-4">
            <p>
              <strong>Type:</strong> {selectedQuestion.langType}
            </p>

            {Object.entries(selectedQuestion.question).map(([lang, text]) => (
              <div key={lang} className="p-3 bg-gray-50 border rounded">
                <strong>{lang.toUpperCase()}:</strong> {text || "—"}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LanguagesPage;
