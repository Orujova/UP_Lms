'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Settings, 
  Folder, 
  Tag, 
  Award, 
  Layers,
  Plus,
  ChevronRight,
  Edit3,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { fetchCourseCategoriesAsync, createCourseCategoryAsync, updateCourseCategoryAsync, deleteCourseCategoryAsync } from '@/redux/courseCategory/courseCategorySlice';
import { fetchCourseTagsAsync, createCourseTagAsync, updateCourseTagAsync, deleteCourseTagAsync } from '@/redux/courseTag/courseTagSlice';
import { fetchCertificatesAsync, createCertificateAsync, updateCertificateAsync, deleteCertificateAsync } from '@/redux/certificate/certificateSlice';
import { fetchClustersAsync, createClusterAsync, updateClusterAsync, deleteClusterAsync } from '@/redux/cluster/clusterSlice';
import LoadingSpinner from '@/components/loadingSpinner';
import DeleteConfirmationModal from '@/components/deleteModal';
import { toast } from 'sonner';

// Modal Component for Create/Edit
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
          emptyData[field.name] = field.type === 'checkbox' ? false : '';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                    errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
              )}
              
              {field.type === 'textarea' && (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm resize-none ${
                    errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
              )}
              
              {field.type === 'select' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                    errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-sm text-gray-700">{field.placeholder}</span>
                </div>
              )}
              
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{initialData ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                initialData ? "Update" : "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, icon: Icon, onEdit, onDelete, children, additionalInfo }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all group relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#0AAC9E]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            {additionalInfo && (
              <div className="mt-1 space-y-1">
                {additionalInfo}
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showDropdown && (
            <>
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(item);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
              <div
                className="fixed inset-0 z-5"
                onClick={() => setShowDropdown(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseSettingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('categories');
  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    tags: '',
    certificates: '',
    clusters: ''
  });
  const [modals, setModals] = useState({
    category: { isOpen: false, data: null },
    tag: { isOpen: false, data: null },
    certificate: { isOpen: false, data: null },
    cluster: { isOpen: false, data: null }
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', item: null });

  // Redux state
  const { categories = [], loading: categoriesLoading } = useSelector(state => state.courseCategory);
  const { tags = [], loading: tagsLoading } = useSelector(state => state.courseTag);
  const { certificates = [], loading: certificatesLoading } = useSelector(state => state.certificate);
  const { clusters = [], loading: clustersLoading } = useSelector(state => state.cluster);

  useEffect(() => {
    dispatch(fetchCourseCategoriesAsync());
    dispatch(fetchCourseTagsAsync());
    dispatch(fetchCertificatesAsync());
    dispatch(fetchClustersAsync());
  }, [dispatch]);

  const tabs = [
    { id: 'categories', label: 'Categories', icon: Folder, count: categories.length },
    { id: 'tags', label: 'Tags', icon: Tag, count: tags.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
    { id: 'clusters', label: 'Clusters', icon: Layers, count: clusters.length }
  ];

  const openModal = (type, data = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, data }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, data: null }
    }));
  };

  const openDeleteModal = (type, item) => {
    setDeleteModal({ isOpen: true, type, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: '', item: null });
  };

  // CRUD Operations
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
    } catch (error) {
      toast.error("Failed to save category: " + error.message);
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
    } catch (error) {
      toast.error("Failed to save tag: " + error.message);
      throw error;
    }
  };

  const handleSaveCertificate = async (data) => {
    try {
      if (modals.certificate.data) {
        await dispatch(updateCertificateAsync({ ...data, id: modals.certificate.data.id })).unwrap();
        toast.success("Certificate updated successfully!");
      } else {
        await dispatch(createCertificateAsync(data)).unwrap();
        toast.success("Certificate created successfully!");
      }
      closeModal('certificate');
    } catch (error) {
      toast.error("Failed to save certificate: " + error.message);
      throw error;
    }
  };

  const handleSaveCluster = async (data) => {
    try {
      if (modals.cluster.data) {
        await dispatch(updateClusterAsync({ ...data, id: modals.cluster.data.id })).unwrap();
        toast.success("Cluster updated successfully!");
      } else {
        await dispatch(createClusterAsync(data)).unwrap();
        toast.success("Cluster created successfully!");
      }
      closeModal('cluster');
    } catch (error) {
      toast.error("Failed to save cluster: " + error.message);
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
          break;
        case 'tag':
          await dispatch(deleteCourseTagAsync(item.id)).unwrap();
          toast.success("Tag deleted successfully!");
          break;
        case 'certificate':
          await dispatch(deleteCertificateAsync(item.id)).unwrap();
          toast.success("Certificate deleted successfully!");
          break;
        case 'cluster':
          await dispatch(deleteClusterAsync(item.id)).unwrap();
          toast.success("Cluster deleted successfully!");
          break;
      }
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete item: " + error.message);
    }
  };

  // Field configurations for modals
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
      case 'certificate':
        return [
          { name: 'name', label: 'Certificate Name', type: 'text', required: true, placeholder: 'Enter certificate name' },
          { name: 'certificateTypeId', label: 'Certificate Type', type: 'select', required: true, placeholder: 'Select type', options: [
            { value: 1, label: 'Certificate of Normal' },
            { value: 2, label: 'Certificate of Achievement' },
            { value: 3, label: 'Certificate of Distinction' }
          ]}
        ];
      case 'cluster':
        return [
          { name: 'subject', label: 'Cluster Name', type: 'text', required: true, placeholder: 'Enter cluster name' },
          { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Enter cluster description' },
          { name: 'paralel', label: 'Parallel Execution', type: 'checkbox', placeholder: 'Allow parallel course completion' },
          { name: 'orderly', label: 'Sequential Order', type: 'checkbox', placeholder: 'Courses must be completed in order' }
        ];
      default:
        return [];
    }
  };

  // Filter functions
  const getFilteredItems = (items, searchTerm) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        const filteredCategories = getFilteredItems(categories, searchTerms.categories);
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Course Categories</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {filteredCategories.length} categories
                </span>
              </div>
              <button
                onClick={() => openModal('category')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerms.categories}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, categories: e.target.value }))}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <ItemCard
                    key={category.id}
                    item={category}
                    icon={Folder}
                    onEdit={(item) => openModal('category', item)}
                    onDelete={(item) => openDeleteModal('category', item)}
                    additionalInfo={
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{category.courseCount || 0} courses</span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'tags':
        const filteredTags = getFilteredItems(tags, searchTerms.tags);
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Course Tags</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {filteredTags.length} tags
                </span>
              </div>
              <button
                onClick={() => openModal('tag')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerms.tags}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Search tags..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>
            </div>

            {tagsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                  <ItemCard
                    key={tag.id}
                    item={tag}
                    icon={Tag}
                    onEdit={(item) => openModal('tag', item)}
                    onDelete={(item) => openDeleteModal('tag', item)}
                    additionalInfo={
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>#{tag.name}</span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'certificates':
        const filteredCertificates = getFilteredItems(certificates, searchTerms.certificates);
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Certificates</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {filteredCertificates.length} templates
                </span>
              </div>
              <button
                onClick={() => openModal('certificate')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerms.certificates}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, certificates: e.target.value }))}
                  placeholder="Search certificates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>
            </div>

            {certificatesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertificates.map((certificate) => (
                  <ItemCard
                    key={certificate.id}
                    item={certificate}
                    icon={Award}
                    onEdit={(item) => openModal('certificate', item)}
                    onDelete={(item) => openDeleteModal('certificate', item)}
                    additionalInfo={
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{certificate.templateFilePath ? 'Has template' : 'No template'}</span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'clusters':
        const filteredClusters = getFilteredItems(clusters, searchTerms.clusters);
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Course Clusters</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {filteredClusters.length} clusters
                </span>
              </div>
              <button
                onClick={() => openModal('cluster')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cluster</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerms.clusters}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, clusters: e.target.value }))}
                  placeholder="Search clusters..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>
            </div>

            {clustersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredClusters.map((cluster) => (
                  <ItemCard
                    key={cluster.id}
                    item={cluster}
                    icon={Layers}
                    onEdit={(item) => openModal('cluster', item)}
                    onDelete={(item) => openDeleteModal('cluster', item)}
                    additionalInfo={
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 line-clamp-2">{cluster.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{cluster.courses?.length || 0} courses</span>
                          {cluster.paralel && <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Parallel</span>}
                          {cluster.orderly && <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">Sequential</span>}
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard/courses')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="text-sm font-medium">Back to Courses</span>
              </button>
              
              <div className="h-6 border-l border-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
                  <Settings className="w-5 h-5 text-[#0AAC9E]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Course Settings</h1>
                  <p className="text-sm text-gray-500">Manage categories, tags, certificates, and clusters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#0AAC9E] text-[#0AAC9E]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? "bg-[#0AAC9E]/10 text-[#0AAC9E]" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
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
        isOpen={modals.certificate.isOpen}
        onClose={() => closeModal('certificate')}
        title={modals.certificate.data ? "Edit Certificate" : "Create Certificate"}
        onSave={handleSaveCertificate}
        initialData={modals.certificate.data}
        fields={getModalFields('certificate')}
      />

      <ManagementModal
        isOpen={modals.cluster.isOpen}
        onClose={() => closeModal('cluster')}
        title={modals.cluster.data ? "Edit Cluster" : "Create Cluster"}
        onSave={handleSaveCluster}
        initialData={modals.cluster.data}
        fields={getModalFields('cluster')}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        item={`${deleteModal.type} "${deleteModal.item?.name}"`}
      />
    </div>
  );
};

export default CourseSettingsPage;