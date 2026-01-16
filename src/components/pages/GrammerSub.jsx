import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import { grammarSubtopicsAPI, topicsAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const GrammerSub = () => {
  const [subtopics, setSubtopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    topicId: "",
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL },
    file: null,          // New file to upload
    imageUrl: "",        // Existing S3 URL
    imagePreview: "",    // Preview for frontend
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, topicRes] = await Promise.all([
        grammarSubtopicsAPI.getAllLanguages(),
        topicsAPI.getAllLanguages(),
      ]);
      setSubtopics(subRes.data.data || []);
      setTopics(topicRes.data.topics || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelected(null);
    setFormData({
      topicId: "",
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL },
      file: null,
      imageUrl: "",
      imagePreview: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setFormData({
      topicId: item.topicId,
      title: item.title,
      description: item.description,
      file: null,  // no new file selected yet
      imageUrl: item.imageUrl,
      imagePreview: item.imageUrl ? item.imageUrl : "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this subtopic?")) return;
    await grammarSubtopicsAPI.delete(item._id);
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("topicId", formData.topicId);
      form.append("title", JSON.stringify(formData.title));
      form.append("description", JSON.stringify(formData.description));

      // Only append file if a new one is selected
      if (formData.file) form.append("imageUrl", formData.file);

      if (selected) {
        await grammarSubtopicsAPI.update(selected._id, form);
      } else {
        await grammarSubtopicsAPI.create(form);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving subtopic:", err);
      alert("Failed to save subtopic");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "imageUrl",
      label: "Image",
      render: (v) =>
        v ? (
          <img
            src={v}
            className="w-14 h-14 rounded object-cover border"
          />
        ) : (
          "—"
        ),
    },
    { key: "title", label: "Title", render: (v) => v?.en || "-" },
    { key: "description", label: "Description", render: (v) => v?.en?.slice(0, 50) + "..." },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grammar Subtopics</h1>

      <DataTable
        data={subtopics}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? "Edit Subtopic" : "Add Subtopic"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.topicId}
            onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select Parent Topic</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.title?.en}</option>
            ))}
          </select>

          <MultilingualInput
            label="Title"
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
          />

          <MultilingualInput
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const MAX_SIZE = 10 * 1024 * 1024; // 10MB
              if (file.size > MAX_SIZE) {
                alert("Image size must be less than 10 MB");
                e.target.value = "";
                return;
              }

              setFormData({
                ...formData,
                file: file,
                imagePreview: URL.createObjectURL(file),
              });
            }}
            className="border p-2 rounded w-full"
          />

          {formData.imagePreview && (
            <img
              src={formData.imagePreview}
              className="h-32 rounded border object-cover mt-2"
            />
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GrammerSub;
