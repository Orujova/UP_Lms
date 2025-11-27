"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Key,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Lock,
} from "lucide-react";
import {
  getRoles,
  getRolePermissions,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  createRolePermission,
  deleteRolePermission,
} from "@/api/accessManagement";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import Pagination from "@/components/ListPagination";
// Custom Checkbox Component
const CustomCheckbox = ({ checked, indeterminate, onChange, onClick }) => {
  const checkboxRef = React.useRef(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        className="sr-only"
      />
      <div
        onClick={onClick}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
          checked
            ? "bg-[#0AAC9E] border-[#0AAC9E]"
            : indeterminate
            ? "bg-[#0AAC9E] border-[#0AAC9E]"
            : "bg-white border-gray-300 hover:border-[#0AAC9E]"
        }`}
      >
        {checked && !indeterminate && (
          <Check className="w-3 h-3 text-white stroke-[3]" />
        )}
        {indeterminate && (
          <div className="w-2 h-0.5 bg-white rounded"></div>
        )}
      </div>
    </div>
  );
};


export default function AccessManagementPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Roles state
  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  
  // All permissions from Permission API
  const [allPermissions, setAllPermissions] = useState([]);
  const [totalAllPermissions, setTotalAllPermissions] = useState(0);
  
  // Role permissions state
  const [rolePermissions, setRolePermissions] = useState([]);
  const [totalRolePermissions, setTotalRolePermissions] = useState(0);
  
  // Collapsible sections state
  const [expandedRoles, setExpandedRoles] = useState({});
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState({});
  
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ roleName: "" });
  
  // Permission modal state
  const [selectedRoleForPermission, setSelectedRoleForPermission] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedEntities, setExpandedEntities] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData, rolePermissionsData] = await Promise.all([
        getRoles(1, 100),
        getPermissions(1, 1000),
        getRolePermissions(1, 1200),
      ]);
      
      setRoles(rolesData.roles || []);
      setTotalRoles(rolesData.totalRoleCount || 0);
      
      setAllPermissions(permissionsData.permissions || []);
      setTotalAllPermissions(permissionsData.totalPermissionCount || 0);
      
      setRolePermissions(rolePermissionsData.rolePermissions || []);
      setTotalRolePermissions(rolePermissionsData.totalRolePermissionCount || 0);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by entity
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.entityName]) {
      acc[perm.entityName] = [];
    }
    acc[perm.entityName].push(perm);
    return acc;
  }, {});

  // Get role's current permissions
  const getRolePermissionIds = (roleId) => {
    return rolePermissions
      .filter(rp => rp.roleId === roleId)
      .map(rp => rp.permissionId);
  };

  // Get role's permissions details
  const getRolePermissionsDetails = (roleId) => {
    return rolePermissions.filter(rp => rp.roleId === roleId);
  };

  // Handle role creation/update
  const handleSaveRole = async () => {
    if (!roleFormData.roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      if (editingRole) {
        await updateRole({ ...roleFormData, id: editingRole.id });
        toast.success("Role updated successfully");
      } else {
        await createRole(roleFormData);
        toast.success("Role created successfully");
      }
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setRoleFormData({ roleName: "" });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!deleteTarget) return;

    try {
      await deleteRole(deleteTarget.id);
      toast.success("Role deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Open permission modal
  const openPermissionModal = (role) => {
    setSelectedRoleForPermission(role);
    const currentPermissions = getRolePermissionIds(role.id);
    setSelectedPermissions(currentPermissions);
    setIsPermissionModalOpen(true);
  };

  // Toggle permission selection
  const togglePermission = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Toggle all permissions for an entity
  const toggleEntityPermissions = (entityPermissions) => {
    const entityPermIds = entityPermissions.map(p => p.id);
    const allSelected = entityPermIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !entityPermIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...entityPermIds])]);
    }
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedRoleForPermission) return;
    
    setSavingPermissions(true);
    try {
      const currentPermissions = getRolePermissionIds(selectedRoleForPermission.id);
      
      // Find permissions to add
      const toAdd = selectedPermissions.filter(id => !currentPermissions.includes(id));
      
      // Find permissions to remove
      const toRemove = currentPermissions.filter(id => !selectedPermissions.includes(id));
      
      // Add new permissions
      for (const permId of toAdd) {
        await createRolePermission({
          roleId: selectedRoleForPermission.id,
          permissionId: permId,
        });
      }
      
      // Remove unchecked permissions
      for (const permId of toRemove) {
        const rolePermToDelete = rolePermissions.find(
          rp => rp.roleId === selectedRoleForPermission.id && rp.permissionId === permId
        );
        if (rolePermToDelete) {
          await deleteRolePermission(rolePermToDelete.id);
        }
      }
      
      toast.success("Permissions updated successfully");
      setIsPermissionModalOpen(false);
      setSelectedRoleForPermission(null);
      setSelectedPermissions([]);
      setExpandedEntities({});
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingPermissions(false);
    }
  };

  // Toggle entity expansion in permission modal
  const toggleEntity = (entityName) => {
    setExpandedEntities(prev => ({
      ...prev,
      [entityName]: !prev[entityName]
    }));
  };

  // Toggle role expansion
  const toggleRoleExpansion = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  // Toggle permission group expansion
  const togglePermissionGroup = (entityName) => {
    setExpandedPermissionGroups(prev => ({
      ...prev,
      [entityName]: !prev[entityName]
    }));
  };

  // Filter functions
  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0AAC9E] rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Access Management</h1>
                <p className="text-xs text-gray-500">Manage roles and permissions</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleFormData({ roleName: "" });
                setIsRoleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#099b8e] transition-colors text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Roles</p>
                  <p className="text-xl font-bold text-gray-900">{totalRoles}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Permissions</p>
                  <p className="text-xl font-bold text-gray-900">{totalAllPermissions}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Assignments</p>
                  <p className="text-xl font-bold text-gray-900">{totalRolePermissions}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] outline-none"
            />
          </div>
        </div>

        {/* Roles Section - Collapsible */}
        <div className="space-y-3">
          {currentRoles.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No roles found</p>
            </div>
          ) : (
            currentRoles.map((role) => {
              const isExpanded = expandedRoles[role.id];
              const rolePerms = getRolePermissionsDetails(role.id);
              const permCount = rolePerms.length;
              
              // Group role permissions by entity
              const groupedRolePerms = rolePerms.reduce((acc, perm) => {
                if (!acc[perm.entityName]) {
                  acc[perm.entityName] = [];
                }
                acc[perm.entityName].push(perm);
                return acc;
              }, {});

              return (
                <div key={role.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Role Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleRoleExpansion(role.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
                        <Shield className="w-5 h-5 text-[#0AAC9E]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{role.roleName}</h3>
                        <p className="text-xs text-gray-500">{permCount} permissions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPermissionModal(role);
                        }}
                        className="px-3 py-1.5 text-xs text-[#0AAC9E] bg-[#0AAC9E]/10 rounded-lg hover:bg-[#0AAC9E]/20 transition-colors"
                      >
                        Edit Permissions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole(role);
                          setRoleFormData({ roleName: role.roleName });
                          setIsRoleModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(role);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {permCount === 0 ? (
                        <div className="p-8 text-center">
                          <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No permissions assigned</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-2">
                          {Object.entries(groupedRolePerms).map(([entityName, perms]) => {
                            const isGroupExpanded = expandedPermissionGroups[`${role.id}-${entityName}`];
                            return (
                              <div key={entityName} className="bg-white rounded-lg border border-gray-200">
                                <div
                                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => togglePermissionGroup(`${role.id}-${entityName}`)}
                                >
                                  <div className="flex items-center gap-2">
                                    {isGroupExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-500" />
                                    )}
                                    <Lock className="w-4 h-4 text-[#0AAC9E]" />
                                    <span className="text-xs font-medium text-gray-900">{entityName}</span>
                                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {perms.length}
                                    </span>
                                  </div>
                                </div>
                                {isGroupExpanded && (
                                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    <div className="flex flex-wrap gap-2">
                                      {perms.map((perm) => (
                                        <span
                                          key={perm.id}
                                          className="px-2.5 py-1 bg-white text-[10px] text-gray-700 rounded-lg border border-gray-200"
                                        >
                                          {perm.action}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredRoles.length > itemsPerPage && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Pagination
              totalItems={filteredRoles.length}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {editingRole ? "Edit Role" : "Add New Role"}
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={roleFormData.roleName}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, roleName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] outline-none"
                placeholder="Enter role name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveRole}
                className="flex-1 bg-[#0AAC9E] text-white px-4 py-2 rounded-lg hover:bg-[#099b8e] transition text-xs font-medium"
              >
                {editingRole ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setEditingRole(null);
                  setRoleFormData({ roleName: "" });
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {isPermissionModalOpen && selectedRoleForPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Manage Permissions
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedRoleForPermission.roleName} • {selectedPermissions.length} selected
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsPermissionModalOpen(false);
                    setSelectedRoleForPermission(null);
                    setSelectedPermissions([]);
                    setExpandedEntities({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {Object.entries(groupedPermissions).sort().map(([entityName, permissions]) => {
                  const isExpanded = expandedEntities[entityName];
                  const entityPermIds = permissions.map(p => p.id);
                  const selectedCount = entityPermIds.filter(id => selectedPermissions.includes(id)).length;
                  const allSelected = selectedCount === permissions.length;
                  const someSelected = selectedCount > 0 && selectedCount < permissions.length;
                  
                  return (
                    <div key={entityName} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleEntity(entityName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <CustomCheckbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleEntityPermissions(permissions);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                            <span className="text-xs font-medium text-gray-900">
                              {entityName}
                            </span>
                            <span className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded">
                              {selectedCount}/{permissions.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {permissions.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <CustomCheckbox
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                />
                                <span className="text-[10px] text-gray-700">{perm.action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="flex-1 bg-[#0AAC9E] text-white px-4 py-2.5 rounded-lg hover:bg-[#099b8e] transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingPermissions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Permissions
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsPermissionModalOpen(false);
                    setSelectedRoleForPermission(null);
                    setSelectedPermissions([]);
                    setExpandedEntities({});
                  }}
                  disabled={savingPermissions}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteRole}
        item="role"
      />
    </div>
  );
}