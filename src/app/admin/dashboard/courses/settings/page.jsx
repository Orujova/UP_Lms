'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings,
  Folder,
  Tag,
  Plus,
  ChevronRight,
  Edit3,
  Trash2,
  Search,
  X,
  Upload,
  Download,
  Filter,
  Check,
  Table2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  MoreVertical,
  Grid3x3
} from 'lucide-react';
import {
  fetchRequirementsAsync,
  fetchCourseNamesAsync,
  createRequirementAsync,
  updateRequirementAsync,
  deleteRequirementsAsync,
  uploadExcelAsync,
  toggleRequirementSelection,
  selectAllRequirements,
  clearSelection
} from '@/redux/positionCourseRequirement/positionCourseRequirementSlice';
import { positionAsync } from '@/redux/position/position';
import { functionalAreaAsync } from '@/redux/functionalArea/functionalArea';
import { downloadTemplateExcel } from '@/api/positionCourseRequirement';
import { fetchCourseCategoriesAsync, createCourseCategoryAsync, updateCourseCategoryAsync, deleteCourseCategoryAsync } from '@/redux/courseCategory/courseCategorySlice';
import { fetchCourseTagsAsync, createCourseTagAsync, updateCourseTagAsync, deleteCourseTagAsync } from '@/redux/courseTag/courseTagSlice';
import LoadingSpinner from '@/components/loadingSpinner';
import DeleteConfirmationModal from '@/components/deleteModal';
import SearchableDropdown from '@/components/searchableDropdown';
import { toast } from 'sonner';
import Pagination from '@/components/ListPagination';
// Modal Component
const ManagementModal = ({ isOpen, onClose, title, onSave, initialData = null, fields = [] }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        const emptyData = {};
        fields.forEach(field => {
          emptyData[field.name] = field.name === 'positionFunctionalAreaPairs' 
            ? [{ positionId: '', functionalAreaId: '' }] 
            : '';
        });
        setFormData(emptyData);
      }
      setErrors({});
    }
  }, [isOpen, initialData, fields]);

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (formData.positionFunctionalAreaPairs) {
      formData.positionFunctionalAreaPairs.forEach((pair, index) => {
        if (!pair.positionId) newErrors[`position_${index}`] = 'Required';
        if (!pair.functionalAreaId) newErrors[`functionalArea_${index}`] = 'Required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPair = () => {
    setFormData(prev => ({
      ...prev,
      positionFunctionalAreaPairs: [...prev.positionFunctionalAreaPairs, { positionId: '', functionalAreaId: '' }]
    }));
  };

  const removePair = (index) => {
    setFormData(prev => ({
      ...prev,
      positionFunctionalAreaPairs: prev.positionFunctionalAreaPairs.filter((_, i) => i !== index)
    }));
  };

  const updatePair = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      positionFunctionalAreaPairs: prev.positionFunctionalAreaPairs.map((pair, i) =>
        i === index ? { ...pair, [field]: parseInt(value) } : pair
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                {field.type === 'pairs' ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label} <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addPair}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Pair
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.positionFunctionalAreaPairs?.map((pair, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <SearchableDropdown
                              options={field.positions?.map(p => ({ id: p.id, name: p.name })) || []}
                              value={pair.positionId}
                              onChange={(e) => updatePair(index, 'positionId', e.target.value)}
                              placeholder="Select Position"
                              className={errors[`position_${index}`] ? "border-red-300" : ""}
                            />
                            <SearchableDropdown
                              options={field.functionalAreas?.map(f => ({ id: f.id, name: f.name })) || []}
                              value={pair.functionalAreaId}
                              onChange={(e) => updatePair(index, 'functionalAreaId', e.target.value)}
                              placeholder="Select Functional Area"
                              className={errors[`functionalArea_${index}`] ? "border-red-300" : ""}
                            />
                          </div>
                          {formData.positionFunctionalAreaPairs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePair(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : field.type === 'searchableSelect' ? (
                  <div>
                    <SearchableDropdown
                      options={field.options?.map(opt => ({ 
                        id: opt.value || opt, 
                        name: opt.label || opt 
                      })) || []}
                      value={formData[field.name]}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        [field.name]: field.isNumber ? parseInt(e.target.value) : e.target.value 
                      }))}
                      placeholder={field.placeholder}
                      label={field.label}
                      required={field.required}
                    />
                    {errors[field.name] && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ) : field.type === 'display' ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                    <p className="text-sm font-medium text-gray-900">{formData[field.name]}</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all ${
                        errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    />
                    {errors[field.name] && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{initialData ? "Updating..." : "Creating..."}</span>
              </div>
            ) : (
              initialData ? "Update" : "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, icon: Icon, onEdit, onDelete, additionalInfo }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#0AAC9E]/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/5 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#0AAC9E]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{item.name}</h3>
            {additionalInfo}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showDropdown && (
            <>
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(item);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
              <div className="fixed inset-0 z-5" onClick={() => setShowDropdown(false)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Training Matrix Component
// Training Matrix Component
const TrainingMatrixView = ({ 
  requirements, 
  positions, 
  functionalAreas, 
  courseNames,
  onCellClick,
  searchTerm,
  filters 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Matrix data: { positionId: { courseName: boolean } }
  const matrixData = {};
  
  // Initialize matrix structure
  positions.forEach(pos => {
    matrixData[pos.id] = {};
    courseNames.forEach(courseName => {
      matrixData[pos.id][courseName] = false;
    });
  });

  // Mark courses as assigned to positions
  requirements.forEach(req => {
    if (matrixData[req.positionId] && matrixData[req.positionId].hasOwnProperty(req.courseName)) {
      matrixData[req.positionId][req.courseName] = true;
    }
  });

  // Apply filters
  const filteredPositions = positions.filter(pos => {
    if (!filters.positionId) return true;
    return pos.id === parseInt(filters.positionId);
  });

  const filteredCourseNames = courseNames.filter(courseName => {
    if (!filters.courseName) return true;
    return courseName === filters.courseName;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPositions = filteredPositions.slice(startIndex, startIndex + itemsPerPage);

  // Toggle course assignment
  const handleCellToggle = (position, courseName) => {
    const isAssigned = matrixData[position.id]?.[courseName];
    onCellClick(position, courseName, isAssigned);
  };

  return (
    <div className="space-y-4">
      {/* Pagination Controls */}
      <div className="bg-white border border-gray-200 rounded-xl py-3 px-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-700">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-24 h-7 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] bg-white"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-4 rotate-180" />
            </button>
            <span className="text-xs text-gray-700 px-3">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left min-w-[180px] border-r-2 border-gray-300">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Position</span>
                </th>
                {filteredCourseNames.map(courseName => (
                  <th 
                    key={courseName} 
                    className="px-3 py-3 text-center min-w-[120px] border-x border-gray-200"
                  >
                    <div className="text-xs font-semibold text-gray-700 leading-tight truncate" title={courseName}>
                      {courseName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedPositions.map((pos) => (
                <tr key={pos.id} className="border-t border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-3 font-semibold text-sm text-gray-900 border-r-2 border-gray-300 bg-gray-50/50">
                    <div className="truncate" title={pos.name}>{pos.name}</div>
                  </td>
                  {filteredCourseNames.map(courseName => {
                    const isAssigned = matrixData[pos.id]?.[courseName];
                    
                    return (
                      <td 
                        key={courseName} 
                        className="border-x border-gray-200 p-2 text-center"
                      >
                        <button
                          onClick={() => handleCellToggle(pos, courseName)}
                          className={`w-full h-12 flex items-center justify-center rounded-lg transition-all ${
                            isAssigned 
                              ? 'bg-emerald-50 hover:bg-emerald-100' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {isAssigned ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedPositions.length === 0 && (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No positions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Cell Detail Modal
const CellDetailModal = ({ isOpen, onClose, position, functionalArea, requirements, onEdit, onAdd }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{position?.name}</h3>
            <p className="text-xs text-gray-500">{functionalArea?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {requirements && requirements.length > 0 ? (
            <div className="space-y-3">
              {requirements.map(req => (
                <div key={req.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${req.isRequired ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-900">{req.courseName}</span>
                  </div>
                  <button
                    onClick={() => {
                      onEdit(req);
                      onClose();
                    }}
                    className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-500">No requirements for this combination</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-xs font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              onAdd(position, functionalArea);
              onClose();
            }}
            className="flex items-center text-xs gap-2 px-5 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors  font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CourseSettingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('categories');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    tags: '',
    matrix: ''
  });
  const [pagination, setPagination] = useState({
    categories: { currentPage: 1, itemsPerPage: 9 },
    tags: { currentPage: 1, itemsPerPage: 12 },
    matrix: { currentPage: 1, itemsPerPage: 10 }
  });
  const [modals, setModals] = useState({
    category: { isOpen: false, data: null },
    tag: { isOpen: false, data: null },
    requirement: { isOpen: false, data: null },
    cellDetail: { isOpen: false, position: null, functionalArea: null, requirements: [] }
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', item: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    positionId: '',
    functionalAreaId: '',
    courseName: ''
  });

  const { categories = [], loading: categoriesLoading } = useSelector(state => state.courseCategory);
  const { tags = [], loading: tagsLoading } = useSelector(state => state.courseTag);
  const { 
    requirements = [], 
    loading: matrixLoading, 
    selectedRequirements = [],
    courseNames = []
  } = useSelector(state => state.positionCourseRequirement || {});
  const { data: positionsData } = useSelector(state => state.position || {});
  const { data: functionalAreasData } = useSelector(state => state.functionalArea || {});

  const positions = positionsData?.positions || [];
  const functionalAreas = Array.isArray(functionalAreasData) 
    ? functionalAreasData[0]?.functionalAreas || []
    : functionalAreasData?.functionalAreas || [];

  useEffect(() => {
    dispatch(fetchCourseCategoriesAsync());
    dispatch(fetchCourseTagsAsync());
    dispatch(fetchRequirementsAsync());
    dispatch(fetchCourseNamesAsync());
    dispatch(positionAsync());
    dispatch(functionalAreaAsync());
  }, [dispatch]);

  const tabs = [
    { id: 'categories', label: 'Categories', icon: Folder, count: categories.length },
    { id: 'tags', label: 'Tags', icon: Tag, count: tags.length },
    { id: 'matrix', label: 'Training Matrix', icon: Table2, count: requirements.length }
  ];

  const handlePageChange = (tab, page) => {
    setPagination(prev => ({
      ...prev,
      [tab]: { ...prev[tab], currentPage: page }
    }));
  };

  const openModal = (type, data = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, data, position: data?.position, functionalArea: data?.functionalArea, requirements: data?.requirements }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, data: null, position: null, functionalArea: null, requirements: [] }
    }));
  };

  const openDeleteModal = (type, item) => {
    setDeleteModal({ isOpen: true, type, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: '', item: null });
  };

  const handleSaveCategory = async (data) => {
    try {
      if (modals.category.data) {
        await dispatch(updateCourseCategoryAsync({ ...data, id: modals.category.data.id })).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await dispatch(createCourseCategoryAsync(data)).unwrap();
        toast.success("Category created successfully!");
      }
      closeModal('category');
      dispatch(fetchCourseCategoriesAsync());
    } catch (error) {
      toast.error("Failed to save category");
      throw error;
    }
  };

  const handleSaveTag = async (data) => {
    try {
      if (modals.tag.data) {
        await dispatch(updateCourseTagAsync({ ...data, id: modals.tag.data.id })).unwrap();
        toast.success("Tag updated successfully!");
      } else {
        await dispatch(createCourseTagAsync(data)).unwrap();
        toast.success("Tag created successfully!");
      }
      closeModal('tag');
      dispatch(fetchCourseTagsAsync());
    } catch (error) {
      toast.error("Failed to save tag");
      throw error;
    }
  };

  const handleSaveRequirement = async (data) => {
    try {
      if (modals.requirement.data) {
        await dispatch(updateRequirementAsync(data)).unwrap();
        toast.success("Requirement updated successfully!");
      } else {
        await dispatch(createRequirementAsync(data)).unwrap();
        toast.success("Requirement created successfully!");
      }
      closeModal('requirement');
      dispatch(fetchRequirementsAsync());
    } catch (error) {
      toast.error("Failed to save requirement");
      throw error;
    }
  };

  const handleDelete = async () => {
    const { type, item } = deleteModal;
    
    try {
      switch (type) {
        case 'category':
          await dispatch(deleteCourseCategoryAsync(item.id)).unwrap();
          toast.success("Category deleted successfully!");
          dispatch(fetchCourseCategoriesAsync());
          break;
        case 'tag':
          await dispatch(deleteCourseTagAsync(item.id)).unwrap();
          toast.success("Tag deleted successfully!");
          dispatch(fetchCourseTagsAsync());
          break;
        case 'requirements':
          await dispatch(deleteRequirementsAsync(selectedRequirements)).unwrap();
          toast.success(`${selectedRequirements.length} requirement(s) deleted successfully!`);
          dispatch(fetchRequirementsAsync());
          dispatch(clearSelection());
          break;
      }
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Please upload an Excel file");
      return;
    }

    try {
      await dispatch(uploadExcelAsync(file)).unwrap();
      toast.success("Excel file uploaded successfully!");
      dispatch(fetchRequirementsAsync());
    } catch (error) {
      toast.error("Failed to upload file");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplateExcel();
    toast.success("Template downloaded!");
  };

  const handleToggleSelection = (id) => {
    dispatch(toggleRequirementSelection(id));
  };

  const handleSelectAll = () => {
    if (selectedRequirements.length === filteredRequirements.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllRequirements());
    }
  };

  const handleCellClick = (position, functionalArea, requirements) => {
    setModals(prev => ({
      ...prev,
      cellDetail: {
        isOpen: true,
        position,
        functionalArea,
        requirements
      }
    }));
  };

  const handleAddFromCell = (position, functionalArea) => {
    openModal('requirement', null);
  };

  const getModalFields = (type) => {
    switch (type) {
      case 'category':
        return [
          { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'Enter category name' }
        ];
      case 'tag':
        return [
          { name: 'name', label: 'Tag Name', type: 'text', required: true, placeholder: 'Enter tag name' }
        ];
      case 'requirement':
        if (modals.requirement.data) {
          return [
            { name: 'courseName', label: 'Course Name', type: 'display' },
            { name: 'newPositionId', label: 'Position', type: 'searchableSelect', required: true, placeholder: 'Select Position', options: positions.map(p => ({ value: p.id, label: p.name })), isNumber: true },
            { name: 'newFunctionalAreaId', label: 'Functional Area', type: 'searchableSelect', required: true, placeholder: 'Select Functional Area', options: functionalAreas.map(f => ({ value: f.id, label: f.name })), isNumber: true }
          ];
        } else {
          return [
            { name: 'courseName', label: 'Course Name', type: 'searchableSelect', required: true, placeholder: 'Select Course', options: courseNames.map(c => ({ value: c, label: c })) },
            { name: 'positionFunctionalAreaPairs', label: 'Position & Functional Area Pairs', type: 'pairs', required: true, positions, functionalAreas }
          ];
        }
      default:
        return [];
    }
  };

  const getFilteredItems = (items, searchTerm) => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => 
      item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = !searchTerms.matrix || 
      req.positionName?.toLowerCase().includes(searchTerms.matrix.toLowerCase()) ||
      req.functionalAreaName?.toLowerCase().includes(searchTerms.matrix.toLowerCase()) ||
      req.courseName?.toLowerCase().includes(searchTerms.matrix.toLowerCase());
    
    const matchesPosition = !filters.positionId || req.positionId === parseInt(filters.positionId);
    const matchesFunctionalArea = !filters.functionalAreaId || req.functionalAreaId === parseInt(filters.functionalAreaId);
    const matchesCourse = !filters.courseName || req.courseName === filters.courseName;

    return matchesSearch && matchesPosition && matchesFunctionalArea && matchesCourse;
  });

  const hasActiveFilters = filters.positionId || filters.functionalAreaId || filters.courseName;

  const getPaginatedItems = (items, tab) => {
    const { currentPage, itemsPerPage } = pagination[tab];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        const filteredCategories = getFilteredItems(categories, searchTerms.categories);
        const paginatedCategories = getPaginatedItems(filteredCategories, 'categories');
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerms.categories}
                  onChange={(e) => {
                    setSearchTerms(prev => ({ ...prev, categories: e.target.value }));
                    setPagination(prev => ({ ...prev, categories: { ...prev.categories, currentPage: 1 } }));
                  }}
                  placeholder="Search categories..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all text-sm"
                />
              </div>
              <button
                onClick={() => openModal('category')}
                className="flex items-center gap-2 px-5 py-3 bg-[#0AAC9E] text-white rounded-xl hover:bg-[#0AAC9E]/90 transition-all shadow-sm hover:shadow text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-sm text-gray-500">
                  {searchTerms.categories ? 'Try adjusting your search' : 'Create your first category to organize courses'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCategories.map((category) => (
                    <ItemCard
                      key={category.id}
                      item={category}
                      icon={Folder}
                      onEdit={(item) => openModal('category', item)}
                      onDelete={(item) => openDeleteModal('category', item)}
                      additionalInfo={
                        <p className="text-sm text-gray-500">
                          {category.courseCount || 0} courses
                        </p>
                      }
                    />
                  ))}
                </div>
                {filteredCategories.length > pagination.categories.itemsPerPage && (
                  <Pagination
                    totalItems={filteredCategories.length}
                    currentPage={pagination.categories.currentPage}
                    itemsPerPage={pagination.categories.itemsPerPage}
                    onPageChange={(page) => handlePageChange('categories', page)}
                  />
                )}
              </>
            )}
          </div>
        );

      case 'tags':
        const filteredTags = getFilteredItems(tags, searchTerms.tags);
        const paginatedTags = getPaginatedItems(filteredTags, 'tags');
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerms.tags}
                  onChange={(e) => {
                    setSearchTerms(prev => ({ ...prev, tags: e.target.value }));
                    setPagination(prev => ({ ...prev, tags: { ...prev.tags, currentPage: 1 } }));
                  }}
                  placeholder="Search tags..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all text-sm"
                />
              </div>
              <button
                onClick={() => openModal('tag')}
                className="flex items-center gap-2 px-5 py-3 bg-[#0AAC9E] text-white rounded-xl hover:bg-[#0AAC9E]/90 transition-all shadow-sm hover:shadow text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>

            {tagsLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No tags found</h3>
                <p className="text-sm text-gray-500">
                  {searchTerms.tags ? 'Try adjusting your search' : 'Create your first tag to label courses'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedTags.map((tag) => (
                    <ItemCard
                      key={tag.id}
                      item={tag}
                      icon={Tag}
                      onEdit={(item) => openModal('tag', item)}
                      onDelete={(item) => openDeleteModal('tag', item)}
                    />
                  ))}
                </div>
                {filteredTags.length > pagination.tags.itemsPerPage && (
                  <Pagination
                    totalItems={filteredTags.length}
                    currentPage={pagination.tags.currentPage}
                    itemsPerPage={pagination.tags.itemsPerPage}
                    onPageChange={(page) => handlePageChange('tags', page)}
                  />
                )}
              </>
            )}
          </div>
        );

      case 'matrix':
        const paginatedRequirements = getPaginatedItems(filteredRequirements, 'matrix');
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      viewMode === 'matrix' ? 'bg-[#0AAC9E] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    Matrix View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      viewMode === 'table' ? 'bg-[#0AAC9E] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Table2 className="w-4 h-4" />
                    Table View
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => openModal('requirement')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0AAC9E] text-white rounded-xl hover:bg-[#0AAC9E]/90 transition-all shadow-sm hover:shadow text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-5" />
                  <input
                    type="text"
                    value={searchTerms.matrix}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, matrix: e.target.value }));
                      setPagination(prev => ({ ...prev, matrix: { ...prev.matrix, currentPage: 1 } }));
                    }}
                    placeholder="Search by position, functional area, or course..."
                    className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all text-xs"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all text-xs font-medium ${
                    showFilters ? 'bg-[#0AAC9E] text-white border-[#0AAC9E]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-3.5 h-4" />
                  Filters
                  {hasActiveFilters && !showFilters && (
                    <span className="w-2 h-2 bg-[#0AAC9E] rounded-full"></span>
                  )}
                </button>

               
              </div>

              {showFilters && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableDropdown
                      options={[{ id: '', name: 'All Positions' }, ...positions.map(p => ({ id: p.id, name: p.name }))]}
                      value={filters.positionId}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, positionId: e.target.value }));
                        setPagination(prev => ({ ...prev, matrix: { ...prev.matrix, currentPage: 1 } }));
                      }}
                      placeholder="All Positions"
                      label="Position"
                    />

                    <SearchableDropdown
                      options={[{ id: '', name: 'All Functional Areas' }, ...functionalAreas.map(f => ({ id: f.id, name: f.name }))]}
                      value={filters.functionalAreaId}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, functionalAreaId: e.target.value }));
                        setPagination(prev => ({ ...prev, matrix: { ...prev.matrix, currentPage: 1 } }));
                      }}
                      placeholder="All Functional Areas"
                      label="Functional Area"
                    />

                    <SearchableDropdown
                      options={[{ id: '', name: 'All Courses' }, ...courseNames.map(c => ({ id: c, name: c }))]}
                      value={filters.courseName}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, courseName: e.target.value }));
                        setPagination(prev => ({ ...prev, matrix: { ...prev.matrix, currentPage: 1 } }));
                      }}
                      placeholder="All Courses"
                      label="Course"
                    />
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => {
                          setFilters({ positionId: '', functionalAreaId: '', courseName: '' });
                          setPagination(prev => ({ ...prev, matrix: { ...prev.matrix, currentPage: 1 } }));
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {matrixLoading ? (
              <div className="flex justify-center py-20 bg-white rounded-2xl border border-gray-200">
                <LoadingSpinner />
              </div>
            ) : viewMode === 'matrix' ? (
              <TrainingMatrixView
                requirements={filteredRequirements}
                positions={positions}
                functionalAreas={functionalAreas}
                courseNames={courseNames}
                onCellClick={handleCellClick}
                searchTerm={searchTerms.matrix}
                filters={filters}
              />
            ) : (
              filteredRequirements.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No requirements found</h3>
                  <p className="text-sm text-gray-500">
                    {searchTerms.matrix || hasActiveFilters 
                      ? 'Try adjusting your search or filters' 
                      : 'Add your first requirement or import from Excel'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="w-12 px-6 py-4 text-left">
                              <input
                                type="checkbox"
                                checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Functional Area</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Required</th>
                            <th className="w-20 px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRequirements.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group border-b border-gray-100 last:border-0">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedRequirements.includes(req.id)}
                                  onChange={() => handleToggleSelection(req.id)}
                                  className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.positionName}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{req.functionalAreaName}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{req.courseName}</td>
                              <td className="px-6 py-4">
                                {req.isRequired ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                                    <Check className="w-3.5 h-3.5" />
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => openModal('requirement', req)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors "
                                >
                                  <Edit3 className="w-4 h-4 text-gray-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedRequirements.length > 0 && (
                      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {selectedRequirements.length} item(s) selected
                        </span>
                        <button
                          onClick={() => openDeleteModal('requirements', null)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Selected
                        </button>
                      </div>
                    )}
                  </div>
                  {filteredRequirements.length > pagination.matrix.itemsPerPage && (
                    <Pagination
                      totalItems={filteredRequirements.length}
                      currentPage={pagination.matrix.currentPage}
                      itemsPerPage={pagination.matrix.itemsPerPage}
                      onPageChange={(page) => handlePageChange('matrix', page)}
                    />
                  )}
                </>
              )
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="bg-white border-b rounded-xl border-gray-200 shadow-sm">
        <div className=" mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-6">
           <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/5 rounded-xl">
                  <Settings className="w-5 h-5 text-[#0AAC9E]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Course Settings</h1>
                  <p className="text-sm text-gray-500">Manage categories, tags, and training matrix</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard/courses')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Courses</span>
              </button>
              
    
              
             
        
          </div>

          <div className="flex gap-8 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-1 py-4 border-b-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-[#0AAC9E] text-[#0AAC9E]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                    activeTab === tab.id 
                      ? "bg-[#0AAC9E]/10 text-[#0AAC9E]" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className=" py-8">
        {renderTabContent()}
      </div>

      <ManagementModal
        isOpen={modals.category.isOpen}
        onClose={() => closeModal('category')}
        title={modals.category.data ? "Edit Category" : "Create Category"}
        onSave={handleSaveCategory}
        initialData={modals.category.data}
        fields={getModalFields('category')}
      />

      <ManagementModal
        isOpen={modals.tag.isOpen}
        onClose={() => closeModal('tag')}
        title={modals.tag.data ? "Edit Tag" : "Create Tag"}
        onSave={handleSaveTag}
        initialData={modals.tag.data}
        fields={getModalFields('tag')}
      />

      <ManagementModal
        isOpen={modals.requirement.isOpen}
        onClose={() => closeModal('requirement')}
        title={modals.requirement.data ? "Edit Requirement" : "Create Requirement"}
        onSave={handleSaveRequirement}
        initialData={modals.requirement.data}
        fields={getModalFields('requirement')}
      />

      <CellDetailModal
        isOpen={modals.cellDetail.isOpen}
        onClose={() => closeModal('cellDetail')}
        position={modals.cellDetail.position}
        functionalArea={modals.cellDetail.functionalArea}
        requirements={modals.cellDetail.requirements}
        onEdit={(req) => openModal('requirement', req)}
        onAdd={handleAddFromCell}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        item={deleteModal.type === 'requirements' 
          ? `${selectedRequirements.length} requirement(s)` 
          : `${deleteModal.type} "${deleteModal.item?.name}"`}
      />
    </div>
  );
};

export default CourseSettingsPage;