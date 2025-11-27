import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://demoadmin.databyte.app/api/";

// Helper function to get headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
  accept: "*/*",
});

// ============ ROLE APIs ============

export const getRoles = async (page = 1, take = 100) => {
  try {
    const response = await fetch(
      `${API_URL}Role?Page=${page}&ShowMore.Take=${take}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]; // Returns { totalRoleCount, roles }
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}Role/GetById?Id=${id}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch role: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching role by ID:", error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await fetch(`${API_URL}Role`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        roleName: roleData.roleName,
        language: roleData.language || "string",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to create role");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (roleData) => {
  try {
    const response = await fetch(`${API_URL}Role`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        id: roleData.id,
        roleName: roleData.roleName,
        language: roleData.language || "string",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update role");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}Role?Id=${id}&Language=string`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to delete role");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// ============ ROLE PERMISSION APIs ============

export const getRolePermissions = async (page = 1, take = 100) => {
  try {
    const response = await fetch(
      `${API_URL}RolePermission?Page=${page}&ShowMore.Take=${take}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch role permissions: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]; // Returns { totalRolePermissionCount, rolePermissions }
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    throw error;
  }
};

export const getRolePermissionById = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}RolePermission/GetById?Id=${id}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch role permission: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching role permission by ID:", error);
    throw error;
  }
};

export const createRolePermission = async (permissionData) => {
  try {
    const response = await fetch(`${API_URL}RolePermission`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        roleId: permissionData.roleId,
        permissionId: permissionData.permissionId,
        language: permissionData.language || "string",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to create role permission");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating role permission:", error);
    throw error;
  }
};

export const updateRolePermission = async (permissionData) => {
  try {
    const response = await fetch(`${API_URL}RolePermission`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        id: permissionData.id,
        roleId: permissionData.roleId,
        permissionId: permissionData.permissionId,
        language: permissionData.language || "string",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update role permission");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating role permission:", error);
    throw error;
  }
};

export const deleteRolePermission = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}RolePermission?Id=${id}&Language=string`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to delete role permission");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting role permission:", error);
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============

// Group permissions by role
export const groupPermissionsByRole = (rolePermissions) => {
  const grouped = {};
  
  rolePermissions.forEach(permission => {
    if (!grouped[permission.roleId]) {
      grouped[permission.roleId] = {
        roleId: permission.roleId,
        roleName: permission.roleName,
        permissions: []
      };
    }
    grouped[permission.roleId].permissions.push(permission);
  });
  
  return Object.values(grouped);
};

// Group permissions by entity
export const groupPermissionsByEntity = (rolePermissions) => {
  const grouped = {};
  
  rolePermissions.forEach(permission => {
    if (!grouped[permission.entityName]) {
      grouped[permission.entityName] = [];
    }
    grouped[permission.entityName].push(permission);
  });
  
  return grouped;
};

// Get unique entities from permissions
export const getUniqueEntities = (rolePermissions) => {
  const entities = new Set();
  rolePermissions.forEach(permission => {
    entities.add(permission.entityName);
  });
  return Array.from(entities).sort();
};

// Get unique actions from permissions
export const getUniqueActions = (rolePermissions) => {
  const actions = new Set();
  rolePermissions.forEach(permission => {
    actions.add(permission.action);
  });
  return Array.from(actions).sort();
};

// ============ PERMISSION APIs ============

export const getPermissions = async (page = 1, take = 1000) => {
  try {
    const response = await fetch(
      `${API_URL}Permission?Page=${page}&ShowMore.Take=${take}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]; // Returns { totalPermissionCount, permissions }
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

export const getPermissionById = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}Permission/GetById?Id=${id}`,
      {
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch permission: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching permission by ID:", error);
    throw error;
  }
};