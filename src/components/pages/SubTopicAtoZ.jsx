import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import { subTopicsAPI, topicsAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const SubTopicAtoZ = () => {
  const [subTopics, setSubTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    topicId: "",
    question: { ...DEFAULT_MULTILINGUAL },
    correctAnswers: { ...DEFAULT_MULTILINGUAL },
    fullWord: { ...DEFAULT_MULTILINGUAL },
    hint: { ...DEFAULT_MULTILINGUAL },
    imageUrl: "",
    imagePreview: "",
  });

  /* -------------------------------- HELPERS -------------------------------- */

  const normalize = (value) => {
    if (!value) return { ...DEFAULT_MULTILINGUAL };
    if (typeof value === "string") return { en: value };
    return value;
  };

  // ⭐ CRITICAL FIX
  // Always convert populated objects → IDs
  const normalizeCorrectAnswers = (value) => {
    if (!value) return { ...DEFAULT_MULTILINGUAL };

    const result = {};

    for (const lang in value) {
      const v = value[lang];

      if (typeof v === "string") {
        result[lang] = v;
      } else if (typeof v === "object" && v?._id) {
        result[lang] = v._id;
      } else {
        result[lang] = "";
      }
    }

    return result;
  };

  const getText = (val) => {
    if (!val) return "-";
    return typeof val === "object"
      ? val.en || Object.values(val)[0] || "-"
      : val;
  };

  /* -------------------------------- FETCH -------------------------------- */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, topicRes] = await Promise.all([
        subTopicsAPI.getAllLanguages(),
        topicsAPI.getAllLanguages(),
      ]);

      const subList = subRes.data.subTopics || [];

      const mapped = subList.map((item) => {
        const topicObj =
          typeof item.topicId === "object" ? item.topicId : null;

        return {
          ...item,
          topicId: topicObj?._id || item.topicId || "",
          topic: topicObj?.title?.en || "—",
          question: item.question || { ...DEFAULT_MULTILINGUAL },
          correctAnswers: item.correctAnswers || {
            ...DEFAULT_MULTILINGUAL,
          },
          fullWord: item.fullWord || { ...DEFAULT_MULTILINGUAL },
          hint: item.hint || { ...DEFAULT_MULTILINGUAL },
        };
      });

      setSubTopics(mapped);
      setTopics(topicRes.data.topics || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- CRUD -------------------------------- */

  const handleAdd = () => {
    setSelectedSubTopic(null);
    setFormData({
      topicId: "",
      question: { ...DEFAULT_MULTILINGUAL },
      correctAnswers: { ...DEFAULT_MULTILINGUAL },
      fullWord: { ...DEFAULT_MULTILINGUAL },
      hint: { ...DEFAULT_MULTILINGUAL },
      imageUrl: "",
      imagePreview: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (subTopic) => {
    setSelectedSubTopic(subTopic);

    setFormData({
      topicId: subTopic.topicId || "",
      question: normalize(subTopic.question),
      correctAnswers: normalizeCorrectAnswers(subTopic.correctAnswers),
      fullWord: normalize(subTopic.fullWord),
      hint: normalize(subTopic.hint),
      imageUrl: subTopic.imageUrl || "",
      imagePreview: subTopic.imageUrl
        ? `${import.meta.env.VITE_API_URL_MEDIA}${subTopic.imageUrl}`
        : "",
    });

    setModalOpen(true);
  };

  const handleDelete = async (subTopic) => {
    if (!window.confirm("Delete this sub-topic?")) return;
    try {
      await subTopicsAPI.delete(subTopic._id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();

      form.append("topicId", formData.topicId);
      form.append("question", JSON.stringify(formData.question));
      form.append(
        "correctAnswers",
        JSON.stringify(formData.correctAnswers)
      );
      form.append("fullWord", JSON.stringify(formData.fullWord));
      form.append("hint", JSON.stringify(formData.hint));

      if (formData.imageUrl instanceof File) {
        form.append("imageUrl", formData.imageUrl);
      }

      if (selectedSubTopic) {
        await subTopicsAPI.update(selectedSubTopic._id, form);
      } else {
        await subTopicsAPI.create(form);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- TABLE -------------------------------- */

  const columns = [
    {
      key: "imageUrl",
      label: "Image",
      render: (value) =>
        value ? (
          <img
            src={`${import.meta.env.VITE_API_URL_MEDIA}${value}`}
            className="w-12 h-12 rounded border object-cover"
          />
        ) : (
          "—"
        ),
    },
    {
      key: "topic",
      label: "Topic",
    },
    {
      key: "question",
      label: "Question",
      render: getText,
    },
    {
      key: "fullWord",
      label: "Full Word",
      render: getText,
    },
  ];

  /* -------------------------------- UI -------------------------------- */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">A to Z Sub-Topics</h1>

      <DataTable
        data={subTopics}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(s) => {
          setSelectedSubTopic(s);
          setViewModalOpen(true);
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSubTopic ? "Edit Sub-Topic" : "Add Sub-Topic"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <select
            value={formData.topicId}
            onChange={(e) =>
              setFormData({ ...formData, topicId: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select a topic</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title?.en}
              </option>
            ))}
          </select>

          <MultilingualInput
            label="Question"
            value={formData.question}
            onChange={(v) =>
              setFormData({ ...formData, question: v })
            }
          />

          <MultilingualInput
            label="Correct Answer"
            type="letters"
            value={formData.correctAnswers}
            onChange={(v) =>
              setFormData({ ...formData, correctAnswers: v })
            }
          />

          <MultilingualInput
            label="Full Word"
            value={formData.fullWord}
            onChange={(v) =>
              setFormData({ ...formData, fullWord: v })
            }
          />

          <MultilingualInput
            label="Hint"
            value={formData.hint}
            onChange={(v) =>
              setFormData({ ...formData, hint: v })
            }
          />

          <input
            type="file"
            accept="image/*"
            className="border p-2 rounded w-full"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (file.size > 10 * 1024 * 1024) {
                alert("Image must be under 10MB");
                return;
              }

              setFormData({
                ...formData,
                imageUrl: file,
                imagePreview: URL.createObjectURL(file),
              });
            }}
          />

          {formData.imagePreview && (
            <img
              src={formData.imagePreview}
              className="h-32 rounded border object-cover"
            />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SubTopicAtoZ;
  