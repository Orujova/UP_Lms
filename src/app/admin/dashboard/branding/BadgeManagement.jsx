import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Award,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchBadgesAsync,
  createBadgeAsync,
  updateBadgeAsync,
  deleteBadgeAsync,
  clearError,
  setFilters,
  resetFilters
} from '@/redux/badge/badgeSlice';

// Image URL utility function
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.includes("https://demoadmin.databyte.app/")) {
    return `https://demoadmin.databyte.app/uploads/${url.replace(
      "https://bravoadmin.uplms.org",
      ""
    )}`;
  }
  return url;
};

// Badge Modal Component
const BadgeModal = ({ isOpen, onClose, badge = null, onSave }) => {
  const [formData, setFormData] = useState({
    badgeName: '',
    badgePhoto: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (badge) {
      setFormData({
        badgeName: badge.badgeName || '',
        badgePhoto: null
      });
      setPreviewUrl(badge.badgePhoto ? getImageUrl(badge.badgePhoto) : '');
    } else {
      setFormData({
        badgeName: '',
        badgePhoto: null
      });
      setPreviewUrl('');
    }
    setErrors({});
  }, [badge, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, badgePhoto: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, badgePhoto: 'File size must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, badgePhoto: file }));
      setPreviewUrl(URL.createObjectURL(file));
      if (errors.badgePhoto) {
        setErrors(prev => ({ ...prev, badgePhoto: null }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, badgePhoto: null }));
    setPreviewUrl('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.badgeName.trim()) {
      newErrors.badgeName = 'Badge name is required';
    } else if (formData.badgeName.length < 2) {
      newErrors.badgeName = 'Badge name must be at least 2 characters';
    }

    if (!badge && !formData.badgePhoto) {
      newErrors.badgePhoto = 'Badge photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        badgeName: formData.badgeName.trim(),
        badgePhoto: formData.badgePhoto
      };

      if (badge) {
        submitData.id = badge.id;
      }

      await onSave(submitData);
      onClose();
      toast.success(`Badge ${badge ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving badge:', error);
      toast.error(error.message || `Failed to ${badge ? 'update' : 'create'} badge`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            {badge ? 'Edit Badge' : 'Create New Badge'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Badge Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.badgeName}
              onChange={(e) => handleInputChange('badgeName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors ${
                errors.badgeName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter badge name"
              maxLength={100}
            />
            {errors.badgeName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.badgeName}
              </p>
            )}
          </div>

          {/* Badge Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Photo {!badge && <span className="text-red-500">*</span>}
            </label>
            
            {previewUrl ? (
              <div className="relative">
                <div className="w-full h-40 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Badge preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <label className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer transition-all duration-200">
                    <Upload size={14} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-600 text-red-600 hover:text-white transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-colors">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop or click to upload badge image
                </p>
                <label className="inline-flex text-xs items-center px-4 py-2 bg-teal-600 text-white  rounded-lg hover:bg-teal-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 5MB
                </p>
              </div>
            )}
            
            {errors.badgePhoto && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.badgePhoto}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-600 text-xs text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {badge ? 'Update Badge' : 'Create Badge'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Badge Card Component
const BadgeCard = ({ badge, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-4">
        {badge.badgePhoto ? (
          <img
            src={getImageUrl(badge.badgePhoto)}
            alt={badge.badgeName}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}>
         
          <button
            onClick={() => onEdit(badge)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-green-600 text-green-600 hover:text-white transition-all duration-200"
            title="Edit Badge"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(badge)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-600 text-red-600 hover:text-white transition-all duration-200"
            title="Delete Badge"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm truncate" title={badge.badgeName}>
          {badge.badgeName}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          ID: {badge.id}
        </p>
      </div>
    </div>
  );
};



// Main Badge Management Component
const BadgeManagement = () => {
  const dispatch = useDispatch();
  const { badges, loading, error, filters } = useSelector(state => state.badge);
  
  const [modalState, setModalState] = useState({
    create: false,
    edit: false,
    view: false,
    selectedBadge: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBadges, setFilteredBadges] = useState([]);

  // Load badges on component mount
  useEffect(() => {
    dispatch(fetchBadgesAsync({ take: 100 }));
  }, [dispatch]);

  // Filter badges based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBadges(badges);
    } else {
      const filtered = badges.filter(badge =>
        badge.badgeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBadges(filtered);
    }
  }, [badges, searchTerm]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreateBadge = () => {
    setModalState({
      create: true,
      edit: false,
      view: false,
      selectedBadge: null
    });
  };

  const handleEditBadge = (badge) => {
    setModalState({
      create: false,
      edit: true,
      view: false,
      selectedBadge: badge
    });
  };

  const handleViewBadge = (badge) => {
    setModalState({
      create: false,
      edit: false,
      view: true,
      selectedBadge: badge
    });
  };

  // UPDATED: Delete badge handler with new API format
  const handleDeleteBadge = async (badge) => {
    if (window.confirm(`Are you sure you want to delete "${badge.badgeName}"?`)) {
      try {
        // Use new delete format with id and language
        const deleteData = {
          id: badge.id,
          language: "string" // Default language as per API spec
        };
        
        console.log('Deleting badge with data:', deleteData);
        await dispatch(deleteBadgeAsync(deleteData)).unwrap();
        toast.success('Badge deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error || 'Failed to delete badge');
      }
    }
  };

  const handleSaveBadge = async (badgeData) => {
    if (modalState.edit) {
      await dispatch(updateBadgeAsync(badgeData)).unwrap();
    } else {
      await dispatch(createBadgeAsync(badgeData)).unwrap();
    }
  };

  const handleCloseModal = () => {
    setModalState({
      create: false,
      edit: false,
      view: false,
      selectedBadge: null
    });
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-5 text-teal-600" />
            Badge Management
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Create and manage badges for your application
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
         
          
          <button
            onClick={handleCreateBadge}
            disabled={loading}
            className="inline-flex items-center text-xs px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50  font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Badge
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearError())}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{filteredBadges.length} badges</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading badges...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No badges found' : 'No badges yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No badges match "${searchTerm}"`
              : 'Get started by creating your first badge'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateBadge}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Badge
            </button>
          )}
        </div>
      )}

      {/* Badge Grid */}
      {!loading && filteredBadges.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onEdit={handleEditBadge}
              onDelete={handleDeleteBadge}
              onView={handleViewBadge}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BadgeModal
        isOpen={modalState.create || modalState.edit}
        onClose={handleCloseModal}
        badge={modalState.selectedBadge}
        onSave={handleSaveBadge}
      />

    </div>
  );
};

export default BadgeManagement;