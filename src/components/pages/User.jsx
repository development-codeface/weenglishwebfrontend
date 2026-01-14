import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { UsersAPI } from "../../services/api";
import { CheckCircle, XCircle, Calendar, Crown, Power } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [togglingUser, setTogglingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await UsersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditingRole(false);

    try {
      const response = await UsersAPI.getUserWithOnboarding(user._id);
      setOnboardingData(response.data);
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      setOnboardingData(null);
    }

    setViewModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await UsersAPI.delete(user._id);
        fetchUsers();
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setEditingRole(false);
      return;
    }

    try {
      await UsersAPI.updateRole(selectedUser._id, newRole);

      setSelectedUser((prev) => ({ ...prev, role: newRole }));

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, role: newRole } : u
        )
      );

      setEditingRole(false);
      alert("User role updated successfully");
    } catch (err) {
      console.error("Role update failed:", err?.response?.data || err);
      alert("Failed to update role");
    }
  };

  // NEW: Toggle user active status
  const handleToggleActive = async (user) => {
    const newStatus = !user.active;
    const action = newStatus ? "activate" : "deactivate";
    
    if (
      window.confirm(
        `Are you sure you want to ${action} user "${user.name}"?`
      )
    ) {
      setTogglingUser(user._id);
      try {
        await UsersAPI.deactivateUser(user._id);
        
        // Update users list
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, active: newStatus } : u
          )
        );

        // Update selected user if viewing
        if (selectedUser?._id === user._id) {
          setSelectedUser((prev) => ({ ...prev, active: newStatus }));
        }

        alert(`User ${action}d successfully`);
      } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        alert(`Failed to ${action} user`);
      } finally {
        setTogglingUser(null);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "profileImage",
      label: "Avatar",
      render: (value, user) => (
        <div className="flex items-center">
          {value ? (
            <img
              src={value.startsWith("http") ? value : value}
              alt={user?.name || "User Avatar"}
              className="h-10 w-10 rounded-full object-cover border-2 border-cyan-200"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value, user) => (
        <div>
          <p className="font-semibold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value === "admin" && <Crown size={12} className="inline mr-1" />}
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (value, user) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(user);
          }}
          disabled={togglingUser === user._id}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit transition-all ${
            value
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          } ${togglingUser === user._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Power size={12} className="mr-1" />
          {value ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "subscription",
      label: "Subscription",
      render: (value) =>
        value?.isActive ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center w-fit">
            <CheckCircle size={12} className="mr-1" />
            Active
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold flex items-center w-fit">
            <XCircle size={12} className="mr-1" />
            Inactive
          </span>
        ),
    },
    {
      key: "isOnboardingComplete",
      label: "Onboarding",
      render: (value) =>
        value ? (
          <span className="text-green-600 font-semibold text-sm">✓ Complete</span>
        ) : (
          <span className="text-orange-600 font-semibold text-sm">
            ⏳ Pending
          </span>
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-600 mt-1">Manage application users</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onView={handleView}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
          setOnboardingData(null);
        }}
        title="User Details"
        size="xlarge"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* USER PROFILE HEADER + STATUS BADGE */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-start space-x-6">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedUser.name}
                    </h2>
                    
                    {/* Active Status Badge */}
                    <button
                      onClick={() => handleToggleActive(selectedUser)}
                      disabled={togglingUser === selectedUser._id}
                      className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-all ${
                        selectedUser.active
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-red-500 text-white hover:bg-red-600"
                      } ${togglingUser === selectedUser._id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Power size={16} className="mr-2" />
                      {selectedUser.active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* ROLE EDIT CONTROLS */}
                  <div className="mt-3 flex items-center space-x-3">
                    {!editingRole ? (
                      <>
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            selectedUser.role === "admin"
                              ? "bg-purple-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {selectedUser.role.toUpperCase()}
                        </span>

                        <button
                          onClick={() => setEditingRole(true)}
                          className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-300"
                        >
                          Change Role
                        </button>
                      </>
                    ) : (
                      <>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="border px-3 py-1 rounded"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={handleRoleUpdate}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setNewRole(selectedUser.role);
                            setEditingRole(false);
                          }}
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            {selectedUser.subscription && (
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Crown className="mr-2 text-yellow-500" size={20} />
                  Subscription Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    {selectedUser.subscription.isActive ? (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold inline-flex items-center">
                        <CheckCircle size={14} className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-semibold inline-flex items-center">
                        <XCircle size={14} className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(selectedUser.subscription.startDate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(selectedUser.subscription.endDate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Days Remaining</p>
                    <p className="font-semibold text-gray-800">
                      {selectedUser.subscription.isActive
                        ? Math.max(
                            0,
                            Math.ceil(
                              (new Date(selectedUser.subscription.endDate) -
                                new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                        : 0}{" "}
                      days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Why Learn Section */}
            {selectedUser.whyLearn && selectedUser.whyLearn.length > 0 && (
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Why Learning
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.whyLearn.map((reason, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Onboarding Answers */}
            {onboardingData?.onboardingAnswers?.length > 0 && (
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Onboarding Responses
                </h3>

                <div className="space-y-4">
                  {onboardingData.onboardingAnswers.map((ans, idx) => {
                    const q = ans.questionText?.en || "Question not available";
                    const selectedIds = ans.userSelected || [];

                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-800 mb-3">
                          Q{idx + 1}: {q}
                        </p>

                        <div className="space-y-2">
                          {ans.options
                            .filter((opt) => selectedIds.includes(opt._id))
                            .map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-cyan-200"
                              >
                                {opt.icon && (
                                  <img
                                    src={opt.icon}
                                    alt="icon"
                                    className="h-8 w-8 object-contain"
                                  />
                                )}
                                <span className="text-gray-700 font-medium">
                                  {opt.text?.en}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Onboarding Status</p>
                  <p className="font-semibold text-gray-800">
                    {selectedUser.isOnboardingComplete ? (
                      <span className="text-green-600">✓ Completed</span>
                    ) : (
                      <span className="text-orange-600">⏳ Incomplete</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Account Created</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Active</p>
                  <p className="font-semibold text-gray-800">
                    {selectedUser.lastActive
                      ? formatDate(selectedUser.lastActive)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage History */}
            {selectedUser.usageHistory &&
              selectedUser.usageHistory.length > 0 && (
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Usage History
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedUser.usageHistory
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          <Calendar size={14} />
                          <span>{new Date(date).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;