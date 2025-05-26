"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "@/authtoken/auth.js";
import { Settings, Plus } from "lucide-react";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

// Position Components
import PositionList from "./positionList";
import PositionFormModal from "./positionForm"; // Import the position modal

// Position Group Components
import PositionGroupList from "./positionGroupList";
import PositionGroupFormModal from "./positionGroupForm"; // Import the position group modal

// Shared Components
import AlertMessage from "./alertMessage";
import MainTabButtons from "@/components/tabNavigation";

const UserSettings = () => {
  // Main navigation state
  const [activeMainTab, setActiveMainTab] = useState("positions"); // 'positions' or 'positionGroups'

  // Position states
  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [selectedPositionGroups, setSelectedPositionGroups] = useState([]);
  const [positionId, setPositionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  // Position list states
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [availablePositionGroups, setAvailablePositionGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPositions, setTotalPositions] = useState(0);

  // Position group states
  const [groupName, setGroupName] = useState("");
  const [positionGroupId, setPositionGroupId] = useState(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [isPositionGroupModalOpen, setIsPositionGroupModalOpen] =
    useState(false);

  // Position group list states
  const [positionGroups, setPositionGroups] = useState([]);
  const [filteredPositionGroups, setFilteredPositionGroups] = useState([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [itemsPerGroupPage, setItemsPerGroupPage] = useState(10);
  const [totalPositionGroups, setTotalPositionGroups] = useState(0);

  // Search states
  const [allPositions, setAllPositions] = useState([]);
  const [allPositionGroups, setAllPositionGroups] = useState([]);

  // Shared states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState("");

  // API config
  const token = getToken();
  const API_URL = "https://bravoadmin.uplms.org/api/";

  // ===== SEARCH FUNCTIONS =====
  // Handle search term and group search term changes
  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleGroupSearchTermChange = (term) => {
    setGroupSearchTerm(term);
    setCurrentGroupPage(1); // Reset to first page when search changes
  };

  // Handle page change for position groups
  const handleGroupPageChange = (newPage) => {
    // Reset filtered results when changing pages (will be refetched)
    setFilteredPositionGroups([]);
    setCurrentGroupPage(newPage);
  };

  // Apply search for positions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // When search is empty, just use paginated results
      setFilteredPositions(positions);
      setTotalPositions(allPositions.length);
    } else {
      // Filter from all positions
      const filtered = allPositions.filter(
        (position) =>
          (position.name &&
            position.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (position.positionGroupName &&
            position.positionGroupName.some(
              (name) =>
                name && name.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );

      // Set filtered positions for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedFiltered = filtered.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setFilteredPositions(paginatedFiltered);
      setTotalPositions(filtered.length);
    }
  }, [searchTerm, positions, allPositions, currentPage, itemsPerPage]);

  // Apply search for position groups
  useEffect(() => {
    // Safety check to ensure we have data before filtering
    if (!allPositionGroups || allPositionGroups.length === 0) {
      return;
    }

    if (groupSearchTerm.trim() === "") {
      // When search is empty, keep the paginated results
      // Don't modify the current filtered results as they come from the API with pagination
    } else {
      // Filter from all position groups
      const filtered = allPositionGroups.filter(
        (group) =>
          group.name &&
          group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
      );

      // Set filtered position groups for current page
      const startIndex = (currentGroupPage - 1) * itemsPerGroupPage;
      const paginatedFiltered = filtered.slice(
        startIndex,
        startIndex + itemsPerGroupPage
      );

      setFilteredPositionGroups(paginatedFiltered);
      setTotalPositionGroups(filtered.length);
    }
  }, [groupSearchTerm, allPositionGroups, currentGroupPage, itemsPerGroupPage]);

  // ===== FETCH DATA =====
  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeMainTab === "positions") {
      fetchPositionGroups();
      fetchPositions();
      fetchAllPositionsForSearch();
    } else if (activeMainTab === "positionGroups") {
      fetchPositionGroups();
      fetchAllPositionGroups();
      fetchAllPositionGroupsForSearch();
    }
  }, [activeMainTab]);

  // Fetch paginated data when page or items per page changes
  useEffect(() => {
    if (activeMainTab === "positions") {
      fetchPositions();
    } else if (activeMainTab === "positionGroups") {
      fetchAllPositionGroups();
    }
  }, [
    currentPage,
    itemsPerPage,
    currentGroupPage,
    itemsPerGroupPage,
    activeMainTab,
  ]);

  // ===== POSITION FUNCTIONS =====
  // Fetch all positions (not paginated) for search
  const fetchAllPositionsForSearch = async () => {
    try {
      const response = await fetch(`${API_URL}Position?ShowMore.Take=1000`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all positions");
      }

      const data = await response.json();
      setAllPositions(data[0].positions);
    } catch (error) {
      console.error("Error fetching all positions:", error);
    }
  };

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
      setFilteredPositions(data[0].positions);
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
      fetchAllPositionsForSearch();
      setIsPositionModalOpen(false); // Close modal after successful creation
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
      fetchAllPositionsForSearch();
      setIsPositionModalOpen(false); // Close modal after successful update
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
      fetchAllPositionsForSearch();
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
    setIsPositionModalOpen(true); // Open modal for editing
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
    setIsPositionModalOpen(true); // Open modal for adding new position
  };

  // Close position modal
  const handleClosePositionModal = () => {
    setIsPositionModalOpen(false);
    resetPositionForm();
  };

  // ===== POSITION GROUP FUNCTIONS =====
  // Fetch all position groups (not paginated) for search
  const fetchAllPositionGroupsForSearch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}PositionGroup?ShowMore.Take=1000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all position groups");
      }

      const data = await response.json();
      if (data && data[0].positionGroups) {
        const allGroups = data[0].positionGroups;
        setAllPositionGroups(allGroups);
        console.log("All position groups for search:", allGroups);
      }
    } catch (error) {
      console.error("Error fetching all position groups:", error);
      setMessage({
        text: "Failed to load search data: " + error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all position groups with pagination
  const fetchAllPositionGroups = async () => {
    try {
      setIsLoading(true);

      // Make sure we're using the currentGroupPage from state for pagination
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
        const groupsData = data[0].positionGroups;

        // Only update display data if we're not searching
        if (groupSearchTerm.trim() === "") {
          setPositionGroups(groupsData);
          setFilteredPositionGroups(groupsData);
        }

        // Always update the total count
        setTotalPositionGroups(data[0].totalPositionGroupCount);

        // Log the data for debugging
        console.log(
          `Fetched position groups for page ${currentGroupPage}:`,
          groupsData
        );
        console.log(
          `Total position groups: ${data[0].totalPositionGroupCount}`
        );
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      console.error("Error fetching position groups:", error);
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
      fetchAllPositionGroupsForSearch();
      setIsPositionGroupModalOpen(false); // Close modal after successful creation
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
      fetchAllPositionGroupsForSearch();
      setIsPositionGroupModalOpen(false); // Close modal after successful update
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
      fetchAllPositionGroupsForSearch();
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
    setIsPositionGroupModalOpen(true); // Open modal for editing
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
    setIsPositionGroupModalOpen(true); // Open modal for adding
  };

  // Close position group modal
  const handleClosePositionGroupModal = () => {
    setIsPositionGroupModalOpen(false);
    resetPositionGroupForm();
  };

  // ===== SHARED FUNCTIONS =====
  // Handle delete click - opens the confirmation modal
  const handleDeleteClick = (id, type) => {
    setItemToDelete(id);
    setDeleteItemType(type);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
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
          <PositionList
            positions={filteredPositions}
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
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

          {/* Position Form Modal */}
          <PositionFormModal
            isOpen={isPositionModalOpen}
            onClose={handleClosePositionModal}
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
            setSearchTerm={handleSearchTermChange}
            handleSubmit={handlePositionSubmit}
            resetForm={resetPositionForm}
          />
        </div>
      )}

      {/* Position Group Management */}
      {activeMainTab === "positionGroups" && (
        <div>
          <PositionGroupList
            positionGroups={filteredPositionGroups}
            isLoading={isLoading}
            searchTerm={groupSearchTerm}
            setSearchTerm={handleGroupSearchTermChange}
            handleAddNew={handleAddNewPositionGroup}
            handleEditPositionGroup={handleEditPositionGroup}
            handleDeleteClick={(id) => handleDeleteClick(id, "positionGroup")}
            currentPage={currentGroupPage}
            setCurrentPage={handleGroupPageChange}
            itemsPerPage={itemsPerGroupPage}
            totalPositionGroups={totalPositionGroups}
          />

          {/* Position Group Form Modal */}
          <PositionGroupFormModal
            isOpen={isPositionGroupModalOpen}
            onClose={handleClosePositionGroupModal}
            name={groupName}
            setName={setGroupName}
            isLoading={isLoading}
            isEditing={isEditingGroup}
            positionGroupId={positionGroupId}
            handleSubmit={handlePositionGroupSubmit}
            resetForm={resetPositionGroupForm}
          />
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
