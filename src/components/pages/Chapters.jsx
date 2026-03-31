import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import LoadingSpinner from "../common/LoadingSpinner";
import { chaptersAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: { ...DEFAULT_MULTILINGUAL },
    intro: { ...DEFAULT_MULTILINGUAL },
    order: "",
    thumbnail: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, []);

const fetchChapters = async () => {
  try {
    setLoading(true);

    const response = await chaptersAPI.getAllLanguages();
    let fetched = response?.data?.chapters || [];

    // 🧠 Normalize: ensure title & intro are objects (and parse JSON strings if needed)
    fetched = fetched.map((chapter) => {
      const parseField = (field) => {
        if (!field) return { en: "" };
        if (typeof field === "string") {
          try {
            const parsed = JSON.parse(field);
            return typeof parsed === "object" ? parsed : { en: parsed };
          } catch {
            return { en: field }; // fallback if plain text
          }
        }
        return field; // already object
      };

      return {
        ...chapter,
        title: parseField(chapter.title),
        intro: parseField(chapter.intro),
      };
    });

    setChapters(fetched);
  } catch (error) {
    console.error(" Error fetching chapters:", error);
    alert(error.response?.data?.message || "Failed to load chapters");
  } finally {
    setLoading(false);
  }
};


  const handleAdd = () => {
    setSelectedChapter(null);
    setFormData({
      title: { ...DEFAULT_MULTILINGUAL },
      intro: { ...DEFAULT_MULTILINGUAL },
      order: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (chapter) => {
    console.log("🟡 Editing chapter:", chapter);
    setSelectedChapter(chapter);
    setFormData({
      title:
        typeof chapter.title === "object"
          ? chapter.title
          : { en: chapter.title || "" },
      intro:
        typeof chapter.intro === "object"
          ? chapter.intro
          : { en: chapter.intro || "" },
      order: chapter.order || "",
      thumbnail: chapter.thumbnail || "", // 👈 added
    });
    setModalOpen(true);
  };

  const handleView = (chapter) => {
    console.log("👁️ Viewing chapter:", chapter);
    setSelectedChapter(chapter);
    setViewModalOpen(true);
  };

  const handleDelete = async (chapter) => {
    if (window.confirm(`Are you sure you want to delete "${chapter.title}"?`)) {
      try {
        console.log("🗑️ Deleting chapter:", chapter._id);
        await chaptersAPI.delete(chapter._id);
        await fetchChapters();
        alert("Chapter deleted successfully");
      } catch (error) {
        console.error("🚨 Error deleting chapter:", error);
        alert("Failed to delete chapter");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("title", JSON.stringify(formData.title));
      form.append("intro", JSON.stringify(formData.intro));
      form.append("order", formData.order);

      if (formData.thumbnail instanceof File) {
        form.append("thumbnail", formData.thumbnail);
      }

      if (selectedChapter) {
        await chaptersAPI.update(selectedChapter._id, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Chapter updated successfully");
      } else {
        await chaptersAPI.create(form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Chapter created successfully");
      }

      setModalOpen(false);
      fetchChapters();
    } catch (error) {
      console.error("🚨 Error saving chapter:", error);
      alert(error.response?.data?.message || "Failed to save chapter");
    } finally {
      setSaving(false);
    }
  };

const columns = [
  { key: "order", label: "Order", render: (v) => v || "-" },

  {
    key: "thumbnail",
    label: "Thumbnail",
    render: (value) =>
      value ? (
        <img
          src={value}
          alt="Thumbnail"
          className="w-16 h-16 object-cover rounded-md border"
        />
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },

  {
    key: "title",
    label: "Title (EN)",
    render: (value) => {
      if (!value) return "-";
      if (typeof value === "object") return value.en || "-";
      return value;
    },
  },

  {
    key: "intro",
    label: "Introduction (EN)",
    render: (value) => {
      if (!value) return "-";
      let text = typeof value === "object" ? value.en || "" : value;
      if (!text) return "-";
      return text.length > 60 ? text.substring(0, 60) + "..." : text;
    },
  },
];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Chapters</h1>
        <p className="text-gray-600 mt-1">
          Manage learning chapters across multiple languages.
        </p>
      </div>

      <DataTable
        data={chapters}
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
        onClose={() => {
          console.log("🔴 Closing Add/Edit Modal");
          setModalOpen(false);
        }}
        title={selectedChapter ? "Edit Chapter" : "Add New Chapter"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <MultilingualInput
            label="Chapter Title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            required
            placeholder="Enter chapter title"
          />

          <MultilingualInput
            label="Introduction"
            value={formData.intro}
            onChange={(value) => setFormData({ ...formData, intro: value })}
            type="textarea"
            placeholder="Enter introduction text"
          />

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chapter Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
             onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    alert("Image size should be less than 10 MB");
    e.target.value = ""; 
    return;
  }

  setFormData({
    ...formData,
    thumbnail: file,
    thumbnailPreview: URL.createObjectURL(file),
  });
}}

              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
            />

            {/* Preview (new upload OR existing backend file) */}
            {formData.thumbnailPreview ? (
              <img
                src={formData.thumbnailPreview}
                alt="New thumbnail"
                className="mt-3 w-48 h-32 rounded-lg border object-cover"
              />
            ) : formData.thumbnail && typeof formData.thumbnail === "string" ? (
              <img
                src={`${import.meta.env.VITE_API_URL_MEDIA}${formData.thumbnail}`}
                alt="Existing thumbnail"
                className="mt-3 w-48 h-32 rounded-lg border object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
              required
              min="1"
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : selectedChapter ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          console.log("Closing View Modal");
          setViewModalOpen(false);
        }}
        title="Chapter Details"
        size="large"
      >
        {selectedChapter ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Order
              </h3>
              <p className="text-lg font-medium">
                {selectedChapter.order || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Thumbnail
              </h3>
              {selectedChapter?.thumbnail ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${
                    selectedChapter.thumbnail
                  }`}
                  alt="Chapter Thumbnail"
                  className="w-64 h-40 object-cover rounded-lg border"
                />
              ) : (
                <p className="text-gray-500 italic">No thumbnail available</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Title (All Languages)
              </h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {selectedChapter?.title &&
                Object.entries(selectedChapter.title).length > 0 ? (
                  Object.entries(selectedChapter.title).map(([lang, value]) => (
                    <div key={lang} className="flex">
                      <span className="w-24 font-medium text-gray-700">
                        {lang.toUpperCase()}:
                      </span>
                      <span className="text-gray-800">{value || "-"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No title available</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Introduction (All Languages)
              </h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {selectedChapter?.intro &&
                Object.entries(selectedChapter.intro).length > 0 ? (
                  Object.entries(selectedChapter.intro).map(([lang, value]) => (
                    <div key={lang} className="flex flex-col mb-3">
                      <span className="font-medium text-gray-700 mb-1">
                        {lang.toUpperCase()}:
                      </span>
                      <span className="text-gray-800">{value || "-"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No introduction available
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </Modal>
    </div>
  );
};

export default Chapters;
