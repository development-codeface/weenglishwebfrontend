import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import MultilingualInput from '../common/MultiLingualInput';
import { discountsAPI } from '../../services/api';
import { DEFAULT_MULTILINGUAL } from '../../utils/constants';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const [formData, setFormData] = useState({
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL },
    image: '',
    discountPercentage: '',
    isActive: true,

    duration: "monthly",
    days: 30,
    actualPrice: "",
    discountPrice: "0.00",
  });

  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // AUTO-CALCULATE DISCOUNT PRICE
  useEffect(() => {
    const actual = parseFloat(formData.actualPrice) || 0;
    const percent = parseFloat(formData.discountPercentage) || 0;

    const calculated = actual - (actual * percent / 100);

    setFormData((prev) => ({
      ...prev,
      discountPrice: calculated.toFixed(2),
    }));
  }, [formData.actualPrice, formData.discountPercentage]);

  const fetchDiscounts = async () => {
    try {
      const response = await discountsAPI.getAllLanguages();
      setDiscounts(response.data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedDiscount(null);
    setFormData({
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL },
      image: '',
      discountPercentage: '',
      isActive: true,
      duration: "monthly",
      days: 30,
      actualPrice: "",
      discountPrice: "0.00",
    });
    setPreviewImage(null);
    setModalOpen(true);
  };

  const handleEdit = (discount) => {
    setSelectedDiscount(discount);

    const mediaBase = import.meta.env.VITE_API_URL_MEDIA || "";

    setFormData({
      title: discount.title || { ...DEFAULT_MULTILINGUAL },
      description: discount.description || { ...DEFAULT_MULTILINGUAL },
      image: discount.image || "",
      discountPercentage: discount.discountPercentage || "",
      isActive: discount.isActive,

      duration: discount.duration || "monthly",
      days: discount.days || 30,
      actualPrice: discount.actualPrice || "",
      discountPrice: discount.discountPrice || "0.00",
    });

    setPreviewImage(discount.image ? `${mediaBase}${discount.image}` : null);
    setModalOpen(true);
  };

  const handleView = (discount) => {
    setSelectedDiscount(discount);
    setViewModalOpen(true);
  };

  const handleDelete = async (discount) => {
    if (window.confirm(`Delete "${discount.title.en}"?`)) {
      try {
        await discountsAPI.delete(discount._id);
        fetchDiscounts();
        alert("Discount deleted");
      } catch (error) {
        console.error("Error deleting discount:", error);
        alert("Failed to delete");
      }
    }
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (file.size > MAX_SIZE) {
    alert("Image size must be less than 10 MB");
    e.target.value = ""; // reset the file input
    return;
  }

  setFormData({ ...formData, image: file });
  setPreviewImage(URL.createObjectURL(file));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", JSON.stringify(formData.title));
      fd.append("description", JSON.stringify(formData.description));
      fd.append("discountPercentage", formData.discountPercentage);
      fd.append("isActive", formData.isActive);

      fd.append("duration", formData.duration);
      fd.append("days", formData.days);
      fd.append("actualPrice", formData.actualPrice);
      fd.append("discountPrice", formData.discountPrice);

      if (formData.image instanceof File) {
        fd.append("image", formData.image);
      }

      if (selectedDiscount) {
        await discountsAPI.update(selectedDiscount._id, fd, true);
        alert("Discount updated");
      } else {
        await discountsAPI.create(fd, true);
        alert("Discount created");
      }

      setModalOpen(false);
      fetchDiscounts();
    } catch (error) {
      console.error("Saving error:", error);
      alert(error.response?.data?.message || "Failed to save discount");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (value) => value?.en || '-' },
    { key: 'discountPercentage', label: 'Discount', render: (v) => `${v}%` },
    { key: 'duration', label: 'Duration' },
    { key: 'days', label: 'Days' },
    { key: 'actualPrice', label: 'Actual Price', render: (v) => `₹${v}` },
    { key: 'discountPrice', label: 'Discount Price', render: (v) => `₹${v}` },
    {
      key: 'image',
      label: 'Image',
      render: (value) =>
        value ? (
          <img
            src={`${import.meta.env.VITE_API_URL_MEDIA}${value}`}
            className="w-12 h-12 object-cover rounded border"
          />
        ) : "—",
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">Discounts</h1>
        <p className="text-gray-600 mt-1">Manage discount offers</p>
      </div>

      <DataTable
        data={discounts}
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
        title={selectedDiscount ? 'Edit Discount' : 'Add New Discount'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">

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
            <label className="block text-sm font-semibold mb-2">Discount Percentage</label>
            <input
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="100"
            />
          </div>

          {/* NEW PRICE + PLAN FIELDS */}
          <div>
            <label className="block text-sm font-semibold mb-2">Actual Price</label>
            <input
              type="number"
              value={formData.actualPrice}
              onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Discount Price (Auto Calculated)</label>
            <input
              type="number"
              value={formData.discountPrice}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Days</label>
            <input
              type="number"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none" />
            {previewImage && (
              <img src={previewImage} className="mt-4 h-32 rounded-lg object-cover border" />
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            Active Discount
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            {saving ? 'Saving...' : selectedDiscount ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Discount Details" size="large">
        {selectedDiscount && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedDiscount.title?.en}</h2>
            <p>{selectedDiscount.discountPercentage}% Off</p>
            <p>Actual Price: ₹{selectedDiscount.actualPrice}</p>
            <p>Discount Price: ₹{selectedDiscount.discountPrice}</p>
            <p>Duration: {selectedDiscount.duration}</p>
            <p>Days: {selectedDiscount.days}</p>

            {selectedDiscount.image && (
              <img
                src={`${import.meta.env.VITE_API_URL_MEDIA}${selectedDiscount.image}`}
                className="h-40 rounded border object-cover"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Discounts;
