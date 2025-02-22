import React, { useState, useEffect } from 'react';
import { Upload, Trash2, ArrowUpDown, Search, X, ImagePlus } from 'lucide-react';
import { getToken } from '@/authtoken/auth.js';
import { toast } from 'sonner';

const ImageContainer = ({ onImageSelect, selectedImage = null }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderBy, setOrderBy] = useState('dateasc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const itemsPerPage = 10;

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/ImageContainer?Page=${page}&ShowMore.Take=${itemsPerPage}&OrderBy=${orderBy}`,
        {
          headers: {
            accept: '*/*',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      if (data && data[0]) {
        setImages(data[0].images);
        setTotalPages(Math.ceil(data[0].totalImageCount / itemsPerPage));
      }
    } catch (error) {
      toast.error('Failed to load images');
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, orderBy]);

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('Images', file);

      const response = await fetch(
        'https://bravoadmin.uplms.org/api/ImageContainer/add-image-from-text-editor',
        {
          method: 'POST',
          headers: {
            accept: '*/*',
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.isSuccess) {
        toast.success('Image uploaded successfully');
        fetchImages(); // Refresh the image list
        return result.images[0]; // Return the uploaded image data
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleDelete = async (imageId) => {
    try {
      const token = getToken();
      const response = await fetch(
        'https://bravoadmin.uplms.org/api/ImageContainer',
        {
          method: 'DELETE',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Id: imageId }),
        }
      );

      const result = await response.json();
      if (result.isSuccess) {
        toast.success('Image deleted successfully');
        fetchImages(); // Refresh the image list
      } else {
        throw new Error(result.message || 'Failed to delete image');
      }
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const filteredImages = images.filter(img => 
    img.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Image Library</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-lg hover:bg-[#127D74] transition"
        >
          <ImagePlus size={18} />
          <span>Upload New</span>
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#0AAC9E]"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:border-[#0AAC9E]"
        >
          <option value="filenameasc">Name (A-Z)</option>
          <option value="filenamedesc">Name (Z-A)</option>
          <option value="dateasc">Date (Oldest)</option>
          <option value="datedesc">Date (Newest)</option>
        </select>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AAC9E]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                selectedImage?.id === image.id
                  ? 'border-[#0AAC9E]'
                  : 'border-transparent'
              }`}
            >
              <img
                src={image.newsImageUrls[0].replace('https://100.42.179.27:7198/imagecontainer/', 'https://bravoadmin.uplms.org/uploads/imagecontainer/')}
                alt={image.fileName}
                className="w-full aspect-video object-cover cursor-pointer"
                onClick={() => onImageSelect(image)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => onImageSelect(image)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                >
                  <ImagePlus size={16} className="text-gray-700" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <p className="text-white text-xs truncate">
                  {image.fileName || 'Untitled'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? 'bg-[#0AAC9E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const uploadedImage = await handleUpload(file);
                      if (uploadedImage) {
                        setShowUploadModal(false);
                      }
                    }
                  }}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageContainer;