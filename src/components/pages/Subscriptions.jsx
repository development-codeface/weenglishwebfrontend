import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import MultilingualInput from "../common/MultiLingualInput";
import { subscriptionsAPI, discountsAPI } from "../../services/api";
import { DEFAULT_MULTILINGUAL, SUBSCRIPTION_DURATIONS } from "../../utils/constants";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [formData, setFormData] = useState({
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL },
    imageUrl: "",
    imagePreview: null,
    price: "",
    duration: "",
    discount: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, discountsRes] = await Promise.all([
        subscriptionsAPI.getAllLanguages(),
        discountsAPI.getAllLanguages(),
      ]);
      setSubscriptions(subsRes.data.plans || []);
      setDiscounts(discountsRes.data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSubscription(null);
    setFormData({
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL },
      imageUrl: "",
      imagePreview: null,
      price: "",
      duration: "",
      discount: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      title: subscription.title || { ...DEFAULT_MULTILINGUAL },
      description: subscription.description || { ...DEFAULT_MULTILINGUAL },
      imageUrl: subscription.imageUrl || "",
      imagePreview: subscription.imageUrl
        ? `${import.meta.env.VITE_API_URL_MEDIA}${subscription.imageUrl}`
        : null,
      price: subscription.price || "",
      duration: subscription.duration || "",
      discount: subscription.discount?._id || "",
      isActive: subscription.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (subscription) => {
    if (!window.confirm(`Delete "${subscription.title.en}"?`)) return;
    try {
      await subscriptionsAPI.delete(subscription._id);
      fetchData();
      alert("Deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("title", JSON.stringify(formData.title));
      form.append("description", JSON.stringify(formData.description));
      form.append("price", Number(formData.price));
      form.append("duration", formData.duration);
      form.append("isActive", formData.isActive ? "true" : "false");

      // ✅ Include discount only if chosen
      if (formData.discount) form.append("discount", formData.discount);
      else form.append("discount", ""); // to clear discount if removed

      if (formData.imageUrl instanceof File)
        form.append("imageUrl", formData.imageUrl);

      if (selectedSubscription) {
        await subscriptionsAPI.update(selectedSubscription._id, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Subscription updated");
      } else {
        await subscriptionsAPI.create(form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Subscription created");
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("API Error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to save subscription");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "title", label: "Title", render: (value) => value?.en || "-" },
    { key: "price", label: "Price", render: (value) => `₹${value}` },
    { key: "duration", label: "Duration" },
    {
      key: "discount",
      label: "Discount",
      render: (value) =>
        value
          ? `${value.title?.en || "-"} (${value.discountPercentage}%)`
          : "—",
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={subscriptions}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSubscription ? "Edit Subscription" : "Add Subscription"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <MultilingualInput
            label="Title"
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
            required
          />

          <MultilingualInput
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            type="textarea"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Price"
              className="border p-2 rounded"
            />

            <select
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Duration</option>
              {SUBSCRIPTION_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Discount dropdown with “No Discount” */}
          <select
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">No Discount</option>
            {discounts.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title.en} ({d.discountPercentage}%)
              </option>
            ))}
          </select>

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

            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
          />

          {formData.imagePreview && (
            <img
              src={formData.imagePreview}
              className="h-32 mt-3 rounded border object-cover"
            />
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            Active
          </label>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            {saving
              ? "Saving..."
              : selectedSubscription
              ? "Update"
              : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;
