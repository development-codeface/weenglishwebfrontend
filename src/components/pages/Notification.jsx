import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { pushNotificationsAPI, UsersAPI } from '../../services/api';
import { Bell, Send, Users, User, CheckCircle, XCircle, X } from 'lucide-react';

const PushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    sentToAll: true,
    userIds: [],
    image: null,
    imagePreview: null
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsRes, usersRes] = await Promise.all([
        pushNotificationsAPI.getAll(),
        UsersAPI.getAll()
      ]);

      setNotifications(notificationsRes.data.notifications || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error("Error loading:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      body: "",
      sentToAll: true,
      userIds: [],
      image: null,
      imagePreview: null
    });
    setModalOpen(true);
  };

  const handleView = (n) => {
    setSelectedNotification(n);
    setViewModalOpen(true);
  };

  const handleAddUser = (id) => {
    if (!id) return;
    if (!formData.userIds.includes(id)) {
      setFormData({ ...formData, userIds: [...formData.userIds, id] });
    }
  };

  const removeUser = (id) => {
    setFormData({
      ...formData,
      userIds: formData.userIds.filter(u => u !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert("Enter a title");
    if (!formData.body.trim()) return alert("Enter a message");

    if (!formData.sentToAll && formData.userIds.length === 0) {
      return alert("Select at least one user");
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("body", formData.body);

      // must convert to string for multipart/form-data
      fd.append("sentToAll", formData.sentToAll ? "true" : "false");

      if (!formData.sentToAll) {
        formData.userIds.forEach(id => fd.append("userIds[]", id));
      }

      // correct field name for multer
      if (formData.image) {
        fd.append("image", formData.image);
      }

      await pushNotificationsAPI.create(fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Notification sent!");
      setModalOpen(false);
      fetchData();

    } catch (error) {
      console.error("Send error:", error);
      alert(error.response?.data?.message || "Failed to send");
    } finally {
      setSaving(false);
    }
  };

  const getSuccessRate = (tokensUsed) => {
    if (!tokensUsed?.length) return { sent: 0, failed: 0, rate: 0 };
    const sent = tokensUsed.filter(t => t.status === "success").length;
    const failed = tokensUsed.length - sent;
    const rate = ((sent / tokensUsed.length) * 100).toFixed(1);
    return { sent, failed, rate };
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, n) => (
        <div className="max-w-xs flex gap-3">

          {n.imageUrl && (
            <img
              src={`${import.meta.env.VITE_API_URL_MEDIA}${n.imageUrl}`}
              alt="thumb"
              className="w-10 h-10 object-cover rounded-md border"
            />
          )}

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Bell size={16} className="text-cyan-600" />
              <span className="font-semibold">{value}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{n.body}</p>
          </div>
        </div>
      )
    },

    {
      key: "sentToAll",
      label: "Recipients",
      render: (value, n) =>
        value ? (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center gap-1">
            <Users size={12} /> All Users
          </span>
        ) : (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
            <User size={12} /> {n.tokensUsed?.length || 0} users
          </span>
        )
    },

    {
      key: "tokensUsed",
      label: "Delivery",
      render: (tokens) => {
        const stats = getSuccessRate(tokens);
        return (
          <div className="flex gap-3 items-center text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={12} /> {stats.sent}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={12} /> {stats.failed}
            </span>
            <span className="text-gray-500">({stats.rate}%)</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Push Notifications</h1>
          <p className="text-gray-600">Manage and send notifications</p>
        </div>

        <button
          onClick={handleAdd}
          className="px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg"
        >
          <Send size={20} /> Send Notification
        </button>
      </div>

      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        onView={handleView}
      />

      {/* SEND MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Send Notification" size="large">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Recipient choice */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <label className="font-semibold">Send To *</label>

            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-cyan-200 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.sentToAll}
                  onChange={() => setFormData({ ...formData, sentToAll: true, userIds: [] })}
                />
                <Users size={20} className="text-purple-600" />
                <div>
                  <p className="font-semibold">All Users</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.sentToAll}
                  onChange={() => setFormData({ ...formData, sentToAll: false })}
                />
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold">Specific Users</p>
                </div>
              </label>
            </div>
          </div>

          {!formData.sentToAll && (
            <div>
              <label className="font-semibold">Choose User</label>

              <select
                className="w-full border p-2 rounded mt-2"
                onChange={(e) => {
                  handleAddUser(e.target.value);
                  e.target.value = "";
                }}>
                <option value="">Select a user...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-3">
                {formData.userIds.map(id => {
                  const u = users.find(x => x._id === id);
                  return (
                    <span key={id} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full flex items-center gap-2">
                      {u?.name}
                      <X size={14} className="cursor-pointer" onClick={() => removeUser(id)} />
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold">Title *</label>
            <input
              type="text"
              className="w-full border p-2 rounded mt-1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="font-semibold">Message *</label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              rows={3}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            />
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="font-semibold">Attach Image (optional)</label>

            <input
              type="file"
              accept="image/*"
              className="w-full mt-2"
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
    image: file,
    imagePreview: URL.createObjectURL(file)
  });
}}

            />

            {formData.imagePreview && (
              <div className="mt-3 bg-gray-50 border rounded-lg p-3 flex flex-col items-start gap-3">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-md border"
                />

                <button
                  type="button"
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-md"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      image: null,
                      imagePreview: null
                    })
                  }
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg"
            >
              {saving ? "Sending…" : "Send Notification"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Notification Details">
        {selectedNotification && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{selectedNotification.title}</h3>
            <p>{selectedNotification.body}</p>

            {selectedNotification.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_URL_MEDIA}${selectedNotification.imageUrl}`}
                className="rounded-lg border max-h-64"
              />
            )}

            <p className="text-gray-500 text-sm">
              Sent at {new Date(selectedNotification.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default PushNotifications;
