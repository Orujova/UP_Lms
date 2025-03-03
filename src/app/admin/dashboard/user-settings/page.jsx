"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "@/authtoken/auth.js";
import { Settings } from "lucide-react";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

// Position Components
import PositionList from "./positionList";
import PositionForm from "./positionForm";
import TabButtons from "./tabButtons";

// Position Group Components
import PositionGroupList from "./positionGroupList";
import PositionGroupForm from "./positionGroupForm";
import PositionGroupTabButtons from "./positionGroupTabButtons";

// Shared Components
import AlertMessage from "./alertMessage";
import MainTabButtons from "@/components/tabNavigation";

const UserSettings = () => {
  // Main navigation state
  const [activeMainTab, setActiveMainTab] = useState("positions"); // 'positions' or 'positionGroups'

  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [selectedPositionGroups, setSelectedPositionGroups] = useState([]);
  const [positionId, setPositionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Position UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'form'

  // Position list states
  const [positions, setPositions] = useState([]);
  const [availablePositionGroups, setAvailablePositionGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPositions, setTotalPositions] = useState(0);

  // ===== POSITION GROUP STATES =====
  // Position group form states
  const [groupName, setGroupName] = useState("");
  const [positionGroupId, setPositionGroupId] = useState(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);

  // Position group UI states
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [activeGroupTab, setActiveGroupTab] = useState("list"); // 'list' or 'form'

  // Position group list states
  const [positionGroups, setPositionGroups] = useState([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [itemsPerGroupPage, setItemsPerGroupPage] = useState(10);
  const [totalPositionGroups, setTotalPositionGroups] = useState(0);

  // ===== SHARED STATES =====
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState(""); // 'position' or 'positionGroup'

  // API config
  const token = getToken();
  const API_URL = "https://bravoadmin.uplms.org/api/";

  // ===== FETCH DATA =====
  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeMainTab === "positions") {
      fetchPositionGroups();
      fetchPositions();
    } else if (activeMainTab === "positionGroups") {
      fetchAllPositionGroups();
    }
  }, [
    activeMainTab,
    currentPage,
    itemsPerPage,
    currentGroupPage,
    itemsPerGroupPage,
  ]);

  // ===== POSITION FUNCTIONS =====
  // Fetch position groups for dropdown
  const fetchPositionGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}PositionGroup`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch position groups");
      }

      const data = await response.json();
      if (data && data[0].positionGroups) {
        setAvailablePositionGroups(data[0].positionGroups);
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch positions with pagination
  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}Position?Page=${currentPage}&ShowMore.Take=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }

      const data = await response.json();
      setPositions(data[0].positions);
      setTotalPositions(data[0].totalPositionCount);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new position
  const createPosition = async (positionData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}Position`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create position");
      }

      setMessage({ text: "Position created successfully!", type: "success" });
      toast.success("Position created successfully!");
      resetPositionForm();
      fetchPositions();
      setActiveTab("list");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing position
  const updatePosition = async (positionData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}Position`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error("Failed to update position");
      }

      setMessage({ text: "Position updated successfully!", type: "success" });
      toast.success("Position updated successfully!");
      resetPositionForm();
      fetchPositions();
      setActiveTab("list");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete position
  const deletePosition = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}Position`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete position");
      }

      setMessage({ text: "Position deleted successfully!", type: "success" });
      toast.success("Position deleted successfully!");
      fetchPositions();
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle position form submission
  const handlePositionSubmit = async (formData) => {
    if (isEditing && positionId) {
      formData.id = positionId;
      await updatePosition(formData);
    } else {
      await createPosition(formData);
    }
  };

  // Edit position handler
  const handleEditPosition = (position) => {
    setPositionId(position.id);
    setName(position.name);
    setLevel(position.level);
    setSelectedPositionGroups(position.positionGroupId || []);
    setIsEditing(true);
    setActiveTab("form");
  };

  // Reset position form
  const resetPositionForm = () => {
    setName("");
    setLevel(0);
    setSelectedPositionGroups([]);
    setSearchTerm("");
    setPositionId(null);
    setIsEditing(false);
    setMessage({ text: "", type: "" });
  };

  // Handle adding new position
  const handleAddNewPosition = () => {
    resetPositionForm();
    setActiveTab("form");
  };

  // ===== POSITION GROUP FUNCTIONS =====
  // Fetch all position groups with pagination
  const fetchAllPositionGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}PositionGroup?Page=${currentGroupPage}&ShowMore.Take=${itemsPerGroupPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch position groups");
      }

      const data = await response.json();
      if (data && data[0].positionGroups) {
        setPositionGroups(data[0].positionGroups);
        setTotalPositionGroups(data[0].totalPositionGroupCount);
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new position group
  const createPositionGroup = async (positionGroupData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}PositionGroup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionGroupData),
      });

      if (!response.ok) {
        throw new Error("Failed to create position group");
      }

      setMessage({
        text: "Position group created successfully!",
        type: "success",
      });
      toast.success("Position group created successfully!");
      resetPositionGroupForm();
      fetchAllPositionGroups();
      setActiveGroupTab("list");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing position group
  const updatePositionGroup = async (positionGroupData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}PositionGroup`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionGroupData),
      });

      if (!response.ok) {
        throw new Error("Failed to update position group");
      }

      setMessage({
        text: "Position group updated successfully!",
        type: "success",
      });
      toast.success("Position group updated successfully!");
      resetPositionGroupForm();
      fetchAllPositionGroups();
      setActiveGroupTab("list");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete position group
  const deletePositionGroup = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}PositionGroup`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete position group");
      }

      setMessage({
        text: "Position group deleted successfully!",
        type: "success",
      });
      toast.success("Position group deleted successfully!");
      fetchAllPositionGroups();
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle position group form submission
  const handlePositionGroupSubmit = async (formData) => {
    if (isEditingGroup && positionGroupId) {
      formData.id = positionGroupId;
      await updatePositionGroup(formData);
    } else {
      await createPositionGroup(formData);
    }
  };

  // Edit position group handler
  const handleEditPositionGroup = (positionGroup) => {
    setPositionGroupId(positionGroup.id);
    setGroupName(positionGroup.name);
    setIsEditingGroup(true);
    setActiveGroupTab("form");
  };

  // Reset position group form
  const resetPositionGroupForm = () => {
    setGroupName("");
    setGroupSearchTerm("");
    setPositionGroupId(null);
    setIsEditingGroup(false);
    setMessage({ text: "", type: "" });
  };

  // Handle adding new position group
  const handleAddNewPositionGroup = () => {
    resetPositionGroupForm();
    setActiveGroupTab("form");
  };

  // ===== SHARED FUNCTIONS =====
  // Handle delete click - opens the confirmation modal
  const handleDeleteClick = (id, type) => {
    setItemToDelete(id);
    setDeleteItemType(type);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete - called when user confirms in modal
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (deleteItemType === "position") {
        deletePosition(itemToDelete);
      } else if (deleteItemType === "positionGroup") {
        deletePositionGroup(itemToDelete);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteItemType("");
    }
  };

  // Reset all forms when switching main tabs
  useEffect(() => {
    if (activeMainTab === "positions") {
      resetPositionGroupForm();
    } else if (activeMainTab === "positionGroups") {
      resetPositionForm();
    }
  }, [activeMainTab]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings size={18} style={{ color: "#1B4E4A" }} className="mr-2" />
          <h1 className="text-xl font-bold text-gray-800">
            {activeMainTab === "positions"
              ? "Position Management"
              : "Position Group Management"}
          </h1>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <MainTabButtons
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        text1={"positions"}
        text2={"positionGroups"}
        name1={"Positions"}
        name2={"Position Groups"}
      />

      {message.text && (
        <AlertMessage message={message} setMessage={setMessage} />
      )}

      {/* Position Management */}
      {activeMainTab === "positions" && (
        <div>
          <div className="flex justify-end mb-4">
            <TabButtons
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleAddNew={handleAddNewPosition}
              isEditing={isEditing}
            />
          </div>

          {activeTab === "list" ? (
            <PositionList
              positions={positions}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleAddNew={handleAddNewPosition}
              handleEditPosition={handleEditPosition}
              handleDeleteClick={(id) => handleDeleteClick(id, "position")}
              getLevelLabel={(value) => {
                const levelOptions = [
                  { value: 0, label: "Manager" },
                  { value: 1, label: "Non-Manager" },
                  { value: 2, label: "N/A" },
                ];
                const option = levelOptions.find((opt) => opt.value === value);
                return option ? option.label : "Unknown";
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPositions={totalPositions}
            />
          ) : (
            <PositionForm
              name={name}
              setName={setName}
              level={level}
              setLevel={setLevel}
              selectedPositionGroups={selectedPositionGroups}
              setSelectedPositionGroups={setSelectedPositionGroups}
              availablePositionGroups={availablePositionGroups}
              isLoading={isLoading}
              isEditing={isEditing}
              positionId={positionId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSubmit={handlePositionSubmit}
              resetForm={resetPositionForm}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      )}

      {/* Position Group Management */}
      {activeMainTab === "positionGroups" && (
        <div>
          <div className="flex justify-end mb-4">
            <PositionGroupTabButtons
              activeTab={activeGroupTab}
              setActiveTab={setActiveGroupTab}
              handleAddNew={handleAddNewPositionGroup}
              isEditing={isEditingGroup}
            />
          </div>

          {activeGroupTab === "list" ? (
            <PositionGroupList
              positionGroups={positionGroups}
              isLoading={isLoading}
              searchTerm={groupSearchTerm}
              setSearchTerm={setGroupSearchTerm}
              handleAddNew={handleAddNewPositionGroup}
              handleEditPositionGroup={handleEditPositionGroup}
              handleDeleteClick={(id) => handleDeleteClick(id, "positionGroup")}
              currentPage={currentGroupPage}
              setCurrentPage={setCurrentGroupPage}
              itemsPerPage={itemsPerGroupPage}
              totalPositionGroups={totalPositionGroups}
            />
          ) : (
            <PositionGroupForm
              name={groupName}
              setName={setGroupName}
              isLoading={isLoading}
              isEditing={isEditingGroup}
              positionGroupId={positionGroupId}
              handleSubmit={handlePositionGroupSubmit}
              resetForm={resetPositionGroupForm}
              setActiveTab={setActiveGroupTab}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item={deleteItemType}
      />
    </div>
  );
};

export default UserSettings;
