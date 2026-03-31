import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { pushMessagesAPI } from "../../services/api";

const LANGS = ["en", "ml", "hi", "ta", "te", "kn"];

const emptyMulti = {
  en: "",
  ml: "",
  hi: "",
  ta: "",
  te: "",
  kn: ""
};

const normalizeMulti = (obj) => {
  const out = { ...emptyMulti };
  if (obj && typeof obj === "object") {
    Object.keys(emptyMulti).forEach((l) => {
      out[l] = obj[l] ?? "";
    });
  }
  return out;
};

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL_MEDIA || ""}${path}`;
};

const normalizeMessage = (msg) => ({
  ...msg,
  fullTitle: normalizeMulti(msg.fullTitle || msg.title),
  fullBody: normalizeMulti(msg.fullBody || msg.body),
  imageUrl: buildImageUrl(msg.imageUrl || msg.image),
  isActive: msg.isActive ?? true
});

const PushMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [formData, setFormData] = useState({
    title: { ...emptyMulti },
    body: { ...emptyMulti },
    image: null,
    imagePreview: "",
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState("en");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await pushMessagesAPI.getAllLanguages();
      const list = res.data.messages?.map(normalizeMessage) || [];
      setMessages(list);
    } catch (err) {
      console.error("fetchMessages:", err);
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedMessage(null);
    setFormData({
      title: { ...emptyMulti },
      body: { ...emptyMulti },
      image: null,
      imagePreview: "",
      isActive: true
    });
    setActiveLang("en");
    setModalOpen(true);
  };

  const handleEdit = (msg) => {
    const safeMsg = normalizeMessage(msg);
    setSelectedMessage(safeMsg);
    setFormData({
      title: safeMsg.fullTitle,
      body: safeMsg.fullBody,
      image: null,
      imagePreview: safeMsg.imageUrl,
      isActive: safeMsg.isActive
    });
    setActiveLang("en");
    setModalOpen(true);
  };

  const handleView = (msg) => {
    setSelectedMessage(normalizeMessage(msg));
    setViewModalOpen(true);
  };

  const handleDelete = async (msg) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await pushMessagesAPI.delete(msg._id);
      fetchMessages();
    } catch (err) {
      console.error("delete:", err);
      alert("Delete failed");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const safeTitle = normalizeMulti(formData.title);
    const safeBody = normalizeMulti(formData.body);
    const fd = new FormData();
    fd.append("title", JSON.stringify(safeTitle));
    fd.append("body", JSON.stringify(safeBody));
    fd.append("isActive", formData.isActive);
    if (formData.image) fd.append("imageUrl", formData.image); // IMPORTANT: field name must match multer.single('image')
    setSaving(true);
    try {
      if (selectedMessage) {
        await pushMessagesAPI.update(selectedMessage._id, fd);
      } else {
        await pushMessagesAPI.create(fd);
      }
      setModalOpen(false);
      fetchMessages();
    } catch (err) {
      console.error("save:", err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

const columns = [
  {
    key: "preview",
    label: "Image",
    render: (_, msg) => (
      <img
        src={buildImageUrl(msg.imageUrl)}
        className="w-12 h-12 rounded border object-cover"
        alt="img"
      />
    )
  },
  {
    key: "title",
    label: "Message",
    render: (_, msg) => (
      <div>
        <div className="font-semibold text-gray-800">
          {msg.fullTitle.en || "—"}
        </div>
        <div className="text-xs text-gray-500">
          {msg.fullBody.en || ""}
        </div>
      </div>
    )
  },
  {
    key: "isActive",
    label: "Status",
    render: (val) => (
      <span
        className={`px-3 py-1 rounded text-xs ${
          val ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
        }`}
      >
        {val ? "Active" : "Inactive"}
      </span>
    )
  }
];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Push Messages</h1>
        <p className="text-gray-600">Multilingual push notification messages</p>
      </div>

      <DataTable
        data={messages}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <Modal
        title={selectedMessage ? "Edit Message" : "New Push Message"}
        isOpen={modalOpen}
        size="large"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-2 border-b pb-2">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className={`px-3 py-1 rounded ${
                  activeLang === l ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-semibold">Title ({activeLang})</label>
            <input
              value={formData.title[activeLang]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: { ...prev.title, [activeLang]: e.target.value || "" }
                }))
              }
              className="w-full p-2 border rounded"
              required={activeLang === "en"}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Body ({activeLang})</label>
            <textarea
              rows={3}
              value={formData.body[activeLang]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  body: { ...prev.body, [activeLang]: e.target.value || "" }
                }))
              }
              className="w-full p-2 border rounded"
              required={activeLang === "en"}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Image</label>
            <div className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="preview"
                  className="w-32 mt-4 rounded border border-gray-300 shadow-sm"
                />
              ) : (
                <p className="text-xs text-gray-500 mt-2">Upload an image</p>
              )}
            </div>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <span className="text-sm">Active</span>
          </label>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-cyan-600 text-white rounded">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Message Details" isOpen={viewModalOpen} size="large" onClose={() => setViewModalOpen(false)}>
        {selectedMessage && (
          <div className="space-y-4">
            {LANGS.map((l) => (
              <div key={l} className="p-3 border rounded bg-gray-50">
                <p className="font-semibold">{l.toUpperCase()}</p>
                <p>{selectedMessage.fullTitle[l] || "—"}</p>
                <p className="text-sm text-gray-600">{selectedMessage.fullBody[l] || ""}</p>
              </div>
            ))}
            {selectedMessage.imageUrl && (
              <img src={selectedMessage.imageUrl} alt="msg-img" className="w-40 rounded border" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PushMessages;
