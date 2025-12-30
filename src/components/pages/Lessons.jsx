import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import { lessonsAPI, chaptersAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL } from "../../utils/constants";

const MEDIA_BASE = (import.meta.env.VITE_API_URL_MEDIA || "").replace(/\/+$/, "");

// Language map for labels + keys (full names as requested)
const LANGUAGES = [
  { key: "en", label: "English" },
  { key: "ml", label: "Malayalam" },
  { key: "ta", label: "Tamil" },
  { key: "te", label: "Telugu" },
  { key: "hi", label: "Hindi" },
  { key: "kn", label: "Kannada" },
];

const emptyMultilingualVideos = () =>
  LANGUAGES.reduce((acc, l) => ((acc[l.key] = ""), acc), {});

const emptyVideoPreviews = () =>
  LANGUAGES.reduce((acc, l) => ((acc[l.key] = null), acc), {});

const ensureMultilingualObj = (val) => {
  if (!val) return { en: "" };
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === "object" && parsed !== null ? parsed : { en: val };
    } catch {
      return { en: val };
    }
  }
  return val;
};

const ensureVideoObj = (val) => {
  // Normalize videoUrl to an object with all language keys.
  if (!val) return emptyMultilingualVideos();
  if (typeof val === "string") {
    // Legacy: single url string -> treat as English
    const obj = emptyMultilingualVideos();
    obj.en = val;
    return obj;
  }
  // Merge with defaults to guarantee all keys
  return { ...emptyMultilingualVideos(), ...val };
};

const buildMediaUrl = (path) => {
  if (!path) return "";
  // If path already starts with http(s), return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // Otherwise, prepend MEDIA_BASE
  return `${MEDIA_BASE}/${String(path).replace(/^\/+/, "")}`;
};


const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin UI state
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    chapterId: "",
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL },
    videoUrl: emptyMultilingualVideos(),
    videoPreview: emptyVideoPreviews(),
    thumbnail: "",
    thumbnailPreview: null,
    question: { ...DEFAULT_MULTILINGUAL },
    options: [{ ...DEFAULT_MULTILINGUAL }, { ...DEFAULT_MULTILINGUAL }],
    correctAnswer: { ...DEFAULT_MULTILINGUAL },
    order: "",
  });

  useEffect(() => {
    fetchChapters();
    fetchLessons();
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      fetchLessonsByChapter(selectedChapterId);
    } else {
      fetchLessons();
    }
  }, [selectedChapterId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await chaptersAPI.getAllLanguages();
      let fetched = response?.data?.chapters || [];

      fetched = fetched.map((chapter) => ({
        ...chapter,
        title: ensureMultilingualObj(chapter.title),
        intro: ensureMultilingualObj(chapter.intro),
      }));

      setChapters(fetched);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      alert(error.response?.data?.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await lessonsAPI.getByChapter();
      const raw = res?.data?.chapters ? res.data.chapters : res?.data || [];
      const fetched = Array.isArray(raw) ? raw : [];

      const normalized = fetched.map((lesson) => normalizeLessonForTable(lesson));
      setLessons(normalized);
    } catch (err) {
      console.error("Error fetching all lessons:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsByChapter = async (chapterId) => {
    try {
      setLoading(true);
      const res = await lessonsAPI.getByChapter(chapterId);
      const fetched = res?.data?.lessons || [];
      const normalized = fetched.map((lesson) => normalizeLessonForTable(lesson));
      setLessons(normalized);
    } catch (err) {
      console.error("Error fetching lessons by chapter:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeLessonForTable = (lesson) => {
    return {
      ...lesson,
      title: ensureMultilingualObj(lesson.title),
      description: ensureMultilingualObj(lesson.description),
      question: ensureMultilingualObj(lesson.question),
      correctAnswer: ensureMultilingualObj(lesson.correctAnswer),
      options:
        Array.isArray(lesson.options) && typeof lesson.options[0] === "string"
          ? lesson.options.map((opt) => ({ en: opt }))
          : lesson.options || [{ en: "" }],
      videoUrl: ensureVideoObj(lesson.videoUrl),
      thumbnail: lesson.thumbnail || "",
    };
  };

  const handleAdd = () => {
    setSelectedLesson(null);
    setFormData({
      chapterId: selectedChapterId || "",
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL },
      videoUrl: emptyMultilingualVideos(),
      videoPreview: emptyVideoPreviews(),
      thumbnail: "",
      thumbnailPreview: null,
      question: { ...DEFAULT_MULTILINGUAL },
      options: [{ ...DEFAULT_MULTILINGUAL }, { ...DEFAULT_MULTILINGUAL }],
      correctAnswer: { ...DEFAULT_MULTILINGUAL },
      order: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (lesson) => {
    setSelectedLesson(lesson);

    const normalized = normalizeLessonForTable(lesson);

    // Build preview urls for existing stored videos
    const previewMap = emptyVideoPreviews();
    LANGUAGES.forEach(({ key }) => {
      const url = normalized.videoUrl?.[key];
      previewMap[key] = url ? buildMediaUrl(url) : null;
    });

    setFormData({
      chapterId: normalized.chapterId || "",
      title: normalized.title || { ...DEFAULT_MULTILINGUAL },
      description: normalized.description || { ...DEFAULT_MULTILINGUAL },
      videoUrl: normalized.videoUrl || emptyMultilingualVideos(),
      videoPreview: previewMap,
      thumbnail: normalized.thumbnail || "",
      thumbnailPreview: normalized.thumbnail ? buildMediaUrl(normalized.thumbnail) : null,
      question: normalized.question || { ...DEFAULT_MULTILINGUAL },
      options:
        normalized.options && normalized.options.length
          ? normalized.options
          : [{ ...DEFAULT_MULTILINGUAL }, { ...DEFAULT_MULTILINGUAL }],
      correctAnswer: normalized.correctAnswer || { ...DEFAULT_MULTILINGUAL },
      order: normalized.order || "",
    });

    setModalOpen(true);
  };

  const handleDelete = async (lesson) => {
    const displayTitle =
      typeof lesson.title === "string"
        ? lesson.title
        : lesson.title?.en || "Untitled";
    if (!window.confirm(`Delete lesson "${displayTitle}"?`)) return;

    try {
      await lessonsAPI.delete(lesson._id);
      alert("Lesson deleted.");
      if (selectedChapterId) await fetchLessonsByChapter(selectedChapterId);
      else await fetchLessons();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const form = new FormData();

      // Required fields
      form.append("chapterId", formData.chapterId);
      form.append("order", formData.order || "1");

      // Stringify multilingual fields as JSON
      form.append("title", JSON.stringify(formData.title));
      form.append("description", JSON.stringify(formData.description));
      form.append("question", JSON.stringify(formData.question));
      form.append("correctAnswer", JSON.stringify(formData.correctAnswer));

      // Options with optionId preservation
      const optionsToSubmit = formData.options.map((opt) => ({
        ...opt,
        ...(opt.optionId && { optionId: opt.optionId }),
      }));
      form.append("options", JSON.stringify(optionsToSubmit));

      // Append per-language videos only if new files are uploaded
      LANGUAGES.forEach(({ key }) => {
        const v = formData.videoUrl[key];
        if (v instanceof File) {
          form.append(`video_${key}`, v);
        }
      });

      // Append thumbnail only if a new file uploaded
      if (formData.thumbnail instanceof File) {
        form.append("thumbnail", formData.thumbnail);
      }

      if (selectedLesson) {
        await lessonsAPI.update(selectedLesson._id, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Lesson updated successfully!");
      } else {
        await lessonsAPI.create(form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Lesson created successfully!");
      }

      setModalOpen(false);
      selectedChapterId
        ? await fetchLessonsByChapter(selectedChapterId)
        : await fetchLessons();
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert(err.response?.data?.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...value,
      ...(newOptions[index].optionId && { optionId: newOptions[index].optionId }),
    };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { ...DEFAULT_MULTILINGUAL }],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (v) => {
        if (!v) return "—";
        return typeof v === "string" ? v : v?.en || Object.values(v)[0] || "—";
      },
    },
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (v) =>
        v ? (
          <img
            src={buildMediaUrl(v)}
            alt="Thumbnail"
            className="w-16 h-16 object-cover rounded-md border"
          />
        ) : (
          "—"
        ),
    },
    {
  key: "videoUrl",
  label: "Video",
  render: (videoObj) =>
    videoObj?.en ? (
      <video
        src={buildMediaUrl(videoObj.en)}
        title="English Video"
        className="w-24 h-16 rounded border"
        muted
        controls
      />
    ) : (
      "—"
    ),
}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Lessons (Admin)</h1>
        <p className="text-gray-600 mt-1">View, create, update and delete lessons.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by Chapter:</label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option key={c._id} value={c._id}>
                {typeof c.title === "string" ? c.title : c.title?.en || "Untitled"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            + Add Lesson
          </button>
        </div>
      </div>

      <div>
        <DataTable
          data={lessons}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedLesson ? "Edit Lesson" : "Add Lesson"}
        size="xlarge"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chapter <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.chapterId}
              onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select chapter</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {typeof c.title === "string" ? c.title : c.title?.en || "Untitled"}
                </option>
              ))}
            </select>
          </div>

          <MultilingualInput
            label="Lesson Title"
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
          />

          <MultilingualInput
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            type="textarea"
          />

          {/* Per-language video uploads */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lesson Videos (Per Language)
            </label>

            {LANGUAGES.map(({ key, label }) => (
              <div key={key} className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({
                      ...prev,
                      videoUrl: { ...prev.videoUrl, [key]: file },
                      videoPreview: { ...prev.videoPreview, [key]: URL.createObjectURL(file) },
                    }));
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                />

                {formData.videoPreview[key] ? (
                  <video
                    src={formData.videoPreview[key]}
                    controls
                    className="mt-2 w-48 rounded-lg border"
                    style={{ maxHeight: "180px" }}
                  />
                ) : formData.videoUrl[key] && typeof formData.videoUrl[key] === "string" ? (
                  <video
                    src={buildMediaUrl(formData.videoUrl[key])}
                    controls
                    className="mt-2 w-48 rounded-lg border"
                    style={{ maxHeight: "180px" }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <input
              type="file"
              accept="image/*"
            onChange={(e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  if (file.size > MAX_SIZE) {
    alert("Thumbnail size must be less than 10 MB");
    e.target.value = "";
    return;
  }

  setFormData({
    ...formData,
    thumbnail: file,
    thumbnailPreview: URL.createObjectURL(file),
  });
}}

              className="w-full px-4 py-2 border rounded-md"
            />

            {formData.thumbnailPreview ? (
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail preview"
                className="mt-3 w-48 rounded-lg border object-cover"
                style={{ maxHeight: "180px" }}
              />
            ) : formData.thumbnail && typeof formData.thumbnail === "string" ? (
              <img
                src={buildMediaUrl(formData.thumbnail)}
                alt="Thumbnail"
                className="mt-3 w-48 rounded-lg border object-cover"
                style={{ maxHeight: "180px" }}
              />
            ) : null}
          </div>

          <MultilingualInput
            label="Quiz Question"
            value={formData.question}
            onChange={(v) => setFormData({ ...formData, question: v })}
          />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Options</h3>
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Add
              </button>
            </div>

            {formData.options.map((opt, i) => (
              <div key={i} className="mb-3 p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <strong>Option {i + 1}</strong>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <MultilingualInput
                  label=""
                  value={opt}
                  onChange={(v) => handleOptionChange(i, v)}
                />
              </div>
            ))}
          </div>

          <MultilingualInput
            label="Correct Answer"
            value={formData.correctAnswer}
            onChange={(v) => setFormData({ ...formData, correctAnswer: v })}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order
            </label>
            <input
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : selectedLesson ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Lessons;
