import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { paymentsAPI } from '../../services/api';
import { CreditCard, CheckCircle, XCircle, Clock, User, MapPin, Phone, DollarSign, Calendar, Hash } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    status: 'pending',
    amount: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setViewModalOpen(true);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      status: payment.status || 'pending',
      amount: payment.amount || ''
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (payment) => {
    if (window.confirm(`Are you sure you want to delete payment transaction ${payment.transactionId}?`)) {
      try {
        await paymentsAPI.delete(payment._id);
        fetchPayments();
        alert('Payment deleted successfully');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment');
      }
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await paymentsAPI.update(selectedPayment._id, formData);
      alert('Payment updated successfully');
      setEditModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(error.response?.data?.message || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Success' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  const columns = [
    { 
      key: 'transactionId', 
      label: 'Transaction ID',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Hash className="text-cyan-600" size={16} />
          <span className="font-mono text-sm font-semibold text-gray-800">{value}</span>
        </div>
      )
    },
    { 
      key: 'user', 
      label: 'User',
      render: (value) => (
        <div>
          <p className="font-semibold text-gray-800">{value?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{value?.email || 'N/A'}</p>
        </div>
      )
    },
    { 
      key: 'plan', 
      label: 'Plan',
      render: (value) => value ? (
        <div>
          <p className="font-semibold text-gray-800">{value.title?.en || 'N/A'}</p>
          <p className="text-xs text-cyan-600 font-semibold">${value.price}</p>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => (
        <span className="font-bold text-lg text-cyan-600">${value || 0}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => (
        <div className="text-xs">
          <div className="text-gray-800 font-medium">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      )
    }
  ];

  const getTotalStats = () => {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const success = payments.filter(p => p.status === 'success').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;

    return { total, success, pending, failed };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-600 mt-1">View and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-cyan-600">${stats.total}</p>
            </div>
            <DollarSign className="text-cyan-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.success}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* View Payment Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Payment Details"
        size="large"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Transaction Header */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <CreditCard className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="text-xl font-bold font-mono text-gray-800">{selectedPayment.transactionId}</p>
                  </div>
                </div>
                {getStatusBadge(selectedPayment.status)}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-cyan-200">
                <span className="text-gray-600 font-medium">Amount Paid</span>
                <span className="text-3xl font-bold text-cyan-600">${selectedPayment.amount || 0}</span>
              </div>
            </div>

            {/* User Information */}
            {selectedPayment.user && (
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.user.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Address */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="text-gray-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="text-gray-600 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Plan */}
            {selectedPayment.plan && (
              <div className="border-2 border-cyan-200 rounded-xl p-6 bg-cyan-50">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Subscription Plan</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Plan Name</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.plan.title?.en || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Plan Price</p>
                    <p className="font-semibold text-cyan-600 text-lg">${selectedPayment.plan.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Created At
                </p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Last Updated
                </p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedPayment.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Payment Status Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Payment"
        size="medium"
      >
        {selectedPayment && (
          <form onSubmit={handleUpdateStatus} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-mono font-bold text-gray-800">{selectedPayment.transactionId}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                required
              >
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Changing payment status will affect the user's subscription status.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 shadow-md"
              >
                {saving ? 'Updating...' : 'Update Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Payments;