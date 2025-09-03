"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Save,
  Plus,
  X,
  Edit3,
  FileText,
  Award,
  AlertTriangle,
  Eye,
  Search,
  RotateCcw,
  Info,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";


// Import certificate API functions
import {
  fetchCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/api/certifcate";



// Format certificate for display
const formatCertificateForDisplay = (cert) => {
  return {
    ...cert,
    hasTemplate: Boolean(cert.templateFilePath),
    createdDate: new Date(),
  };
};

// Certificate Modal Component
const CertificateModal = ({ 
  isOpen, 
  onClose, 
  certificate, 
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    templateFile: null
  });
  const [templatePreview, setTemplatePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (certificate) {
      setFormData({
        name: certificate.name || '',
        templateFile: null
      });
      setTemplatePreview(certificate.templateFilePath);
    } else {
      setFormData({
        name: '',
        templateFile: null
      });
      setTemplatePreview(null);
    }
    setErrors({});
  }, [certificate, isOpen]);

  const validateForm = () => {
    console.log('Validating form data:', formData);
    
    const errorObj = {};
    
    if (!formData.name || !formData.name.trim()) {
      errorObj.name = 'Certificate name is required';
    }
    
    console.log('Validation errors:', errorObj);
    setErrors(errorObj);
    
    const isValid = Object.keys(errorObj).length === 0;
    console.log('Form is valid:', isValid);
    
    return isValid;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, templateFile: file }));
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setTemplatePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setTemplatePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submission started', formData); // Debug log
    
    if (!validateForm()) {
      console.log('Form validation failed', errors); // Debug log
      return;
    }

    console.log('Form validated successfully, calling onSave'); // Debug log
    
    const submitData = {
      name: formData.name,
      certificateTypeId: 1, // Fixed value
      templateFile: formData.templateFile,
      language: 'az', // Fixed to Azerbaijani
      ...(certificate && { id: certificate.id })
    };

    console.log('Submit data:', submitData); // Debug log
    onSave(submitData);
  };

  const removeTemplate = () => {
    setFormData(prev => ({ ...prev, templateFile: null }));
    setTemplatePreview(certificate ? certificate.templateFilePath : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {certificate ? 'Edit Certificate' : 'Add Certificate'}
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Certificate Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter certificate name"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Template File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template File
            </label>
            
            {templatePreview ? (
              <div className="relative border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FileText className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formData.templateFile?.name || 'Existing template'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.templateFile?.size ? 
                        `${(formData.templateFile.size / 1024).toFixed(1)} KB` : 
                        'Template file'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeTemplate}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 group">
                <div className="p-3 bg-teal-100 rounded-full mx-auto w-fit mb-3 group-hover:bg-teal-200 transition-colors">
                  <Upload className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Upload template file</p>
                <p className="text-xs text-gray-500 mb-4">PDF, JPEG, or PNG (max 5MB)</p>
                <label className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 cursor-pointer transition-all shadow-md">
                  <Upload size={14} className="mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,image/jpeg,image/png"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={14} />
                  {certificate ? 'Update' : 'Create'} Certificate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Certificate Card Component
const CertificateCard = ({ certificate, onEdit, onDelete }) => {
  const hasTemplate = certificate.templateFilePath;
  
  return (
    <div className="py-2 px-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${hasTemplate ? 'bg-green-50' : 'bg-orange-50'}`}>
            <Award className={`w-4 h-6 ${hasTemplate ? 'text-green-300' : 'text-orange-300'}`} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">

            <h4 className="text-xs font-semibold text-gray-900">{certificate.name}</h4>
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hasTemplate ? ' text-green-500' : ' text-orange-500'
                }`}>
                {hasTemplate ? 'Has Template' : 'No Template'}
              </span>
             
            </div>
                  </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasTemplate && (
            <button
              onClick={() => window.open(certificate.templateFilePath, '_blank')}
              className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
              title="View Template"
            >
              <Eye size={14} />
            </button>
          )}
          <button
            onClick={() => onEdit(certificate)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit Certificate"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(certificate.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Certificate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Certificate Management Section Component
const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load certificates
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const certificatesData = await fetchCertificates({ take: 100 });
      setCertificates(certificatesData.map(cert => formatCertificateForDisplay(cert)));
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCertificate = async (certificateData) => {
    console.log('handleSaveCertificate called with:', certificateData); // Debug log
    setLoading(true);
    
    try {
      let savedCertificate;
      if (editingCertificate) {
        console.log('Updating certificate...'); // Debug log
        savedCertificate = await updateCertificate({
          ...certificateData,
          id: editingCertificate.id
        });
        setCertificates(prev => 
          prev.map(cert => cert.id === editingCertificate.id ? 
            formatCertificateForDisplay(savedCertificate) : cert)
        );
        toast.success('Certificate updated successfully');
      } else {
        console.log('Creating new certificate...'); // Debug log
        savedCertificate = await createCertificate(certificateData);
        console.log('Created certificate:', savedCertificate); // Debug log
        setCertificates(prev => [formatCertificateForDisplay(savedCertificate), ...prev]);
        toast.success('Certificate created successfully');
      }
      
      setShowModal(false);
      setEditingCertificate(null);
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error(`Failed to save certificate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    
    setLoading(true);
    try {
      await deleteCertificate(certificateId);
      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
      toast.success('Certificate deleted successfully');
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    setShowModal(true);
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-5 text-teal-600" />
            Certificate Management
          </h3>
          <p className="text-xs text-gray-600 mt-1">Manage certificate templates for your customers</p>
        </div>
        <button
          onClick={() => {
            setEditingCertificate(null);
            setShowModal(true);
          }}
          className="inline-flex items-center text-xs px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md"
          disabled={loading}
        >
          <Plus className="mr-2" size={14} />
          Add Certificate
        </button>
      </div>

      {/* Search */}
      
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
     

      {/* Certificate List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-teal-100 rounded-full mx-auto w-fit mb-4">
              <Award className="h-8 w-8 text-teal-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h4>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Create your first certificate template'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
              >
                <Plus className="mr-2" size={16} />
                Add Certificate
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCertificates.map(certificate => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onEdit={handleEditCertificate}
                onDelete={handleDeleteCertificate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCertificate(null);
        }}
        certificate={editingCertificate}
        onSave={handleSaveCertificate}
        loading={loading}
      />
    </div>
  );
};

export default CertificateManagement