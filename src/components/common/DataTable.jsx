import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';

const DataTable = ({
  data = [], // ✅ default to safe empty array
  columns = [],
  onEdit,
  onDelete,
  onView,
  onAdd,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🧠 Ensure data and columns are valid
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  // 🔍 Safe filtering with try/catch (no crashes on weird data)
  const filteredData = safeData.filter((item) => {
    try {
      return safeColumns.some((col) => {
        const value = item?.[col.key];
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some((v) =>
            String(v || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      });
    } catch (err) {
      console.warn('⚠️ Error filtering row:', err, item);
      return false;
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // 🚨 Debug guard (shows bad prop shapes)
  if (!Array.isArray(data)) {
    console.error('❌ DataTable: Expected `data` as array but got:', data);
  }
  if (!Array.isArray(columns)) {
    console.error('❌ DataTable: Expected `columns` as array but got:', columns);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
            />
          </div>

          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span className="font-semibold">Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                {safeColumns.map((col) => (
                  <th
                    key={col.key || col.label}
                    className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={safeColumns.length + 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No data available</p>
                      <p className="text-sm mt-2">
                        Try adjusting your search or add new items
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-cyan-50 transition">
                    {safeColumns.map((col) => {
                      let cellContent = '-';
                      try {
                        const value = item?.[col.key];
                        cellContent = col.render
                          ? col.render(value, item)
                          : typeof value === 'object' && value !== null
                          ? value?.en || JSON.stringify(value)
                          : String(value || '-');
                      } catch (err) {
                        console.warn('⚠️ Render error at column:', col.key, err);
                      }

                      return (
                        <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                          {cellContent}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredData.length > itemsPerPage && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
