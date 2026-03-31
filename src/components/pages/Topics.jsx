import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import { topicsAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [formData, setFormData] = useState({
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL },
    imageUrl: "", // can be a file or string
    imagePreview: "",
    redirect: "topic",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await topicsAPI.getAllLanguages();
      console.log("Res:", res.data);

      setTopics(res.data.topics || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTopic(null);
    setFormData({
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL },
      imageUrl: "",
      imagePreview: "",
      redirect: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (topic) => {
    setSelectedTopic(topic);

    const normalizeField = (field) => {
      if (typeof field === "string") return { en: field };
      if (typeof field === "object") return field;
      return { ...DEFAULT_MULTILINGUAL };
    };

    setFormData({
      title: normalizeField(topic.title),
      description: normalizeField(topic.description),
      imageUrl: topic.imageUrl || "",
      redirect: topic.redirect,

      imagePreview: topic.imageUrl
        ? `${import.meta.env.VITE_API_URL_MEDIA}${topic.imageUrl}`
        : "",
    });

    setModalOpen(true);
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete topic "${topic.title?.en || "Untitled"}"?`))
      return;

    try {
      await topicsAPI.delete(topic._id);
      fetchTopics();
      alert("Topic deleted successfully");
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("title", JSON.stringify(formData.title));
      form.append("description", JSON.stringify(formData.description));
      form.append("redirect", formData.redirect);

      if (formData.imageUrl instanceof File) {
        form.append("imageUrl", formData.imageUrl);
      }

      if (selectedTopic) {
        await topicsAPI.update(selectedTopic._id, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Topic updated successfully");
      } else {
        await topicsAPI.create(form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Topic created successfully");
      }

      setModalOpen(false);
      fetchTopics();
    } catch (err) {
      console.error("Error saving:", err);
      alert(err.response?.data?.message || "Failed to save topic");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "imageUrl",
      label: "Image",
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="Topic"
            className="w-14 h-14 object-cover rounded border"
          />
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (value) => (typeof value === "object" ? value.en || "-" : value),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => {
        const text = typeof value === "object" ? value.en || "" : value;
        return text.length > 50 ? text.substring(0, 50) + "..." : text;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Topics</h1>
        <p className="text-gray-600">Manage learning topics</p>
      </div>

      <DataTable
        data={topics}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(topic) => {
          setSelectedTopic(topic);
          setViewModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* Add + Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTopic ? "Edit Topic" : "Add Topic"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <MultilingualInput
            label="Title"
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
          />

          <MultilingualInput
            label="Description"
            value={formData.description}
            type="textarea"
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
          <div>
            <label className="block mb-2 font-medium">Redirect Action</label>
            <select
              className="border rounded p-2 w-full"
              value={formData.redirect}
              onChange={(e) =>
                setFormData({ ...formData, redirect: e.target.value })
              }
              required
            >
              <option value="">Select Redirect Action</option>
              <option value="topic">Topic</option>
              <option value="mcq">MCQ</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 font-medium">Topic Image</label>
            <input
              type="file"
              accept="image/*"
             onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  if (file.size > MAX_SIZE) {
    alert("Image size must be less than 10 MB");
    e.target.value = "";
    return;
  }

  setFormData({
    ...formData,
    imageUrl: file,
    imagePreview: URL.createObjectURL(file),
  });
}}

              className="border rounded p-2 w-full"
            />
            {(formData.imagePreview || formData.imageUrl) && (
              <img
                src={
                  formData.imagePreview ||
                  `${import.meta.env.VITE_API_URL_MEDIA}${formData.imageUrl}`
                }
                alt="Preview"
                className="mt-3 h-32 w-auto rounded border"
              />
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Saving..." : selectedTopic ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Topic Details"
      >
        {selectedTopic && (
          <div className="space-y-4">
            <img
              src={`${import.meta.env.VITE_API_URL_MEDIA}${
                selectedTopic.imageUrl
              }`}
              alt={selectedTopic.title?.en}
              className="h-48 rounded border object-cover"
            />
            <h2 className="text-xl font-semibold">{selectedTopic.title?.en}</h2>
            <p className="text-gray-700">{selectedTopic.description?.en}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Topics;
