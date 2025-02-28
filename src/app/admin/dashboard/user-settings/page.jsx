"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "@/authtoken/auth.js";
import { Settings } from "lucide-react";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

// Component Imports
import PositionList from "./positionList";
import PositionForm from "./positionForm";
import AlertMessage from "./alertMessage";
import TabButtons from "./tabButtons";

const UserSettings = () => {
  // State for form inputs
  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [selectedPositionGroups, setSelectedPositionGroups] = useState([]);
  const [positionId, setPositionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'form'

  // State for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);

  // State for position list
  const [positions, setPositions] = useState([]);
  const [availablePositionGroups, setAvailablePositionGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPositions, setTotalPositions] = useState(0);

  // API config
  const token = getToken();
  const API_URL = "https://bravoadmin.uplms.org/api/";

  // Fetch all data on component mount
  useEffect(() => {
    fetchPositionGroups();
    fetchPositions();
  }, [currentPage, itemsPerPage]);

  // Fetch position groups
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
      resetForm();
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
      resetForm();
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

  // Handle delete click - opens the confirmation modal
  const handleDeleteClick = (id) => {
    setPositionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete - called when user confirms in modal
  const handleConfirmDelete = () => {
    if (positionToDelete) {
      deletePosition(positionToDelete);
      setIsDeleteModalOpen(false);
      setPositionToDelete(null);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (formData) => {
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

  // Reset form
  const resetForm = () => {
    setName("");
    setLevel(0);
    setSelectedPositionGroups([]);
    setSearchTerm("");
    setPositionId(null);
    setIsEditing(false);
    setMessage({ text: "", type: "" });
  };

  // Handle adding new position
  const handleAddNew = () => {
    resetForm();
    setActiveTab("form");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="flex items-center justify-between mb-6 pb-3 ">
        <div className="flex items-center">
          <Settings size={18} style={{ color: "#1B4E4A" }} className="mr-2" />
          <h1 className="text-xl font-bold text-gray-800">
            Position Management
          </h1>
        </div>

        <TabButtons
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleAddNew={handleAddNew}
          isEditing={isEditing}
        />
      </div>

      {message.text && (
        <AlertMessage message={message} setMessage={setMessage} />
      )}

      {activeTab === "list" ? (
        <PositionList
          positions={positions}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleAddNew={handleAddNew}
          handleEditPosition={handleEditPosition}
          deletePosition={deletePosition}
          handleDeleteClick={handleDeleteClick}
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
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item="position"
      />
    </div>
  );
};

export default UserSettings;
