import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { languagesAPI, nativeLang } from '../../services/api';

const NativeLang = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await nativeLang.getAll();
      setLanguages(response.data.languages || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      alert('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedLanguage(null);
    setFormData({
      code: '',
      name: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const handleEdit = (language) => {
    setSelectedLanguage(language);
    setFormData({
      code: language.code || '',
      name: language.name || '',
      isActive: language.isActive !== undefined ? language.isActive : true
    });
    setModalOpen(true);
  };

  const handleView = (language) => {
    setSelectedLanguage(language);
    setViewModalOpen(true);
  };

  const handleDelete = async (language) => {
    if (window.confirm(`Are you sure you want to delete "${language.name}"?`)) {
      try {
        await nativeLang.delete(language._id);
        fetchLanguages();
        alert('Language deleted successfully');
      } catch (error) {
        console.error('Error deleting language:', error);
        alert('Failed to delete language');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      alert('Please enter language code');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter language name');
      return;
    }

    // Validate code format (2-3 lowercase letters)
    const codeRegex = /^[a-z]{2,3}$/;
    if (!codeRegex.test(formData.code.toLowerCase())) {
      alert('Language code must be 2-3 lowercase letters (e.g., en, ml, ta)');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        code: formData.code.toLowerCase(),
        name: formData.name,
        isActive: formData.isActive
      };

      if (selectedLanguage) {
        await nativeLang.update(selectedLanguage._id, submitData);
        alert('Language updated successfully');
      } else {
        await nativeLang.create(submitData);
        alert('Language created successfully');
      }
      setModalOpen(false);
      fetchLanguages();
    } catch (error) {
      console.error('Error saving language:', error);
      if (error.response?.status === 409) {
        alert('Language code already exists. Please use a different code.');
      } else {
        alert(error.response?.data?.message || 'Failed to save language');
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { 
      key: 'code', 
      label: 'Code',
      render: (value) => (
        <span className="font-mono font-bold text-cyan-600 uppercase bg-cyan-50 px-3 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      key: 'name', 
      label: 'Language Name',
      render: (value) => (
        <span className="font-semibold text-gray-800">{value}</span>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? '✓ Active' : '✕ Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Languages</h1>
        <p className="text-gray-600 mt-1">Manage supported languages for the application</p>
      </div>

      <DataTable
        data={languages}
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
        title={selectedLanguage ? 'Edit Language' : 'Add New Language'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition font-mono uppercase"
              required
              placeholder="e.g., en, ml, ta, te, hi, kn"
              maxLength={3}
              pattern="[a-z]{2,3}"
              disabled={selectedLanguage !== null}
            />
            <p className="text-xs text-gray-500 mt-1">
              ISO 639-1 code (2-3 lowercase letters). Cannot be changed after creation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              required
              placeholder="e.g., English, Malayalam, Tamil"
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Active Language
            </label>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only active languages will be available for users to select in the application.
            </p>
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
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 shadow-md"
            >
              {saving ? 'Saving...' : selectedLanguage ? 'Update Language' : 'Create Language'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Language Details"
        size="medium"
      >
        {selectedLanguage && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Language Code</p>
                  <p className="text-3xl font-bold font-mono text-cyan-600 uppercase">
                    {selectedLanguage.code}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedLanguage.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {selectedLanguage.isActive ? '✓ Active' : '✕ Inactive'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Language Name</h3>
              <p className="text-2xl font-bold text-gray-800">{selectedLanguage.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Created At</p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedLanguage.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedLanguage.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              selectedLanguage.isActive 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-sm font-semibold mb-2 text-gray-700">Status Information</p>
              <p className="text-sm text-gray-600">
                {selectedLanguage.isActive 
                  ? 'This language is currently active and available for users to select in the application.' 
                  : 'This language is currently inactive and will not be shown to users.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NativeLang;