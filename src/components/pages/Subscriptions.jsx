import React, { useEffect, useState } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { subscriptionsAPI } from "../../services/api";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    duration: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await subscriptionsAPI.getAll();
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setFormData({
      name: "",
      amount: "",
      duration: "",
      description: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || "",
      amount: plan.amount || "",
      duration: plan.duration || "",
      description: plan.description || "",
      isActive: plan.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Deactivate "${plan.name}"?`)) return;
    await subscriptionsAPI.delete(plan._id);
    fetchPlans();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedPlan) {
        await subscriptionsAPI.update(selectedPlan._id, formData);
        alert("Plan updated");
      } else {
        await subscriptionsAPI.create(formData);
        alert("Plan created");
      }

      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "amount", label: "Amount", render: (v) => `₹${v}` },
    { key: "duration", label: "Duration" },
    {
      key: "isActive",
      label: "Status",
      render: (v) => (
        <span className={`px-2 py-1 text-xs rounded ${v ? "bg-green-100" : "bg-red-100"}`}>
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={plans}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPlan ? "Edit Plan" : "Add Plan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Plan Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <input
            required
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <input
            required
            placeholder="Duration (e.g. 30_days)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded w-full"
          />

          <label className="flex gap-2 items-center">
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
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {saving ? "Saving..." : selectedPlan ? "Update" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
