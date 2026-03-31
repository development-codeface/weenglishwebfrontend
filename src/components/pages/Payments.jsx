import React, { useEffect, useState } from "react";
import DataTable from "../common/DataTable";
import { rechargeAPI } from "../../services/api";
import {
  Hash,
  DollarSign,
  Clock,
  Calendar,
  User,
  Mail,
} from "lucide-react";

const RechargeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // ADMIN – all users history
      const res = await rechargeAPI.getAllHistory();
      setHistory(res.data.rechargeHistory || []);
    } catch (err) {
      console.error("Recharge history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "userName",
      label: "User",
      render: (_, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <User size={14} className="text-blue-600" />
            {row.userName}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Mail size={12} />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "transactionId",
      label: "Transaction ID",
      render: (v) => (
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-cyan-600" />
          <span className="font-mono text-sm font-semibold">{v}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v) => (
        <div className="flex items-center gap-1 font-bold text-green-600">
          <DollarSign size={16} /> ₹{v}
        </div>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (v) => (
        <div className="flex items-center gap-1">
          <Clock size={14} />
          {Math.floor(v / 60)} mins
        </div>
      ),
    },
    {
      key: "rechargeDate",
      label: "Date",
      render: (v) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(v).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(v).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ];

  const totalAmount = history.reduce((s, h) => s + (h.amount || 0), 0);
  const totalDuration = history.reduce((s, h) => s + (h.duration || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Recharge History
        </h1>
        <p className="text-gray-600 mt-1">
          All users recharge transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            ₹{totalAmount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Talk Time</p>
          <p className="text-3xl font-bold text-blue-600">
            {Math.floor(totalDuration / 60)} mins
          </p>
        </div>
      </div>

      <DataTable
        data={history}
        columns={columns}
        loading={loading}
      />
    </div>
  );
};

export default RechargeHistory;
