import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import MultilingualInput from '../common/MultiLingualInput';
import { chatCategoriesAPI } from '../../services/api';
import { DEFAULT_MULTILINGUAL } from '../../utils/constants';

const ChatCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    image: null,
    previewImage: null,
    title: { ...DEFAULT_MULTILINGUAL },
    description: { ...DEFAULT_MULTILINGUAL }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

const fetchCategories = async () => {
  try {
    setLoading(true);
    const response = await chatCategoriesAPI.getAllLanguages();
    const raw = response.data || [];

    const cleaned = raw.map(cat => {
      const normalizeField = (val) => {
        if (!val) return { ...DEFAULT_MULTILINGUAL };
        if (typeof val === "string") {
          return { ...DEFAULT_MULTILINGUAL, en: val };   
        }
        if (typeof val === "object") return val;       
        return { ...DEFAULT_MULTILINGUAL };
      };

      return {
        ...cat,
        title: normalizeField(cat.title),
        description: normalizeField(cat.description),
      };
    });

    setCategories(cleaned);
  } catch (error) {
    console.error("Error fetching categories:", error);
  } finally {
    setLoading(false);
  }
};


  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({
      image: null,
      previewImage: null,
      title: { ...DEFAULT_MULTILINGUAL },
      description: { ...DEFAULT_MULTILINGUAL }
    });
    setModalOpen(true);
  };

  const handleEdit = (category) => {
  setSelectedCategory(category);

  setFormData({
    image: null,
    previewImage: category.image?.startsWith("http")
      ? category.image
      : `${import.meta.env.VITE_API_URL_MEDIA}${category.image}`,

    title: typeof category.title === "object"
      ? category.title
      : { ...DEFAULT_MULTILINGUAL, en: category.title || "" },

    description: typeof category.description === "object"
      ? category.description
      : { ...DEFAULT_MULTILINGUAL, en: category.description || "" },
  });

  setModalOpen(true);
};


  const handleView = (category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.title?.en}"?`)) {
      try {
        await chatCategoriesAPI.delete(category._id);
        fetchCategories();
        alert('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("title", JSON.stringify(formData.title));
      form.append("description", JSON.stringify(formData.description));

      // Only append file if it's a new upload
      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      if (selectedCategory) {
        await chatCategoriesAPI.update(selectedCategory._id, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert('Category updated successfully');
      } else {
        await chatCategoriesAPI.create(form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert('Category created successfully');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (value) => value?.en || '-' },
    { key: 'description', label: 'Description', render: (value) => value?.en?.substring(0, 40) + '...' || '-' },
{
  key: "image",
  label: "Image",
  render: (value) =>
    value ? (
      <img
        src={
          value.startsWith("http")
            ? value
            : value
        }
        alt="Category"
        className="w-12 h-12 object-cover rounded-md border"
      />
    ) : (
      "—"
    ),
}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Chat Categories</h1>
        <p className="text-gray-600 mt-1">Manage conversation categories</p>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedCategory ? "Edit Category" : "Add Category"} size="large">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category Image</label>
            <input
              type="file"
              accept="image/*"
          onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  if (file.size > MAX_SIZE) {
    alert("Image size must be less than 10 MB");
    e.target.value = ""; // reset input
    return;
  }

  setFormData({
    ...formData,
    image: file,
    previewImage: URL.createObjectURL(file),
  });
}}

              className="w-full border p-2 rounded"
            />

            {formData.previewImage && (
              <img src={formData.previewImage} className="mt-3 h-32 rounded-lg object-cover" />
            )}

            {(!formData.previewImage && typeof formData.image === "string") && (
              <img
                src={`${import.meta.env.VITE_API_URL_MEDIA}/${formData.image}`}
                className="mt-3 h-32 rounded-lg object-cover"
              />
            )}
          </div>

          <MultilingualInput label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
          <MultilingualInput label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} type="textarea" />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-500 text-white rounded">
              {saving ? "Saving..." : selectedCategory ? "Update" : "Create"}
            </button>
          </div>

        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Category Details" size="large">
        {selectedCategory && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{selectedCategory.title?.en}</h3>
            <img src={selectedCategory.image} alt="" className="h-40 rounded-lg object-contain" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatCategories;
