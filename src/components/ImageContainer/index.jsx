import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Search, X, ImagePlus, Loader } from "lucide-react";
import { getToken ,getUserId} from "@/authtoken/auth.js";
import { toast } from "sonner";

const ImageContainer = ({ onImageSelect, selectedImage = null, onCancel }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderBy, setOrderBy] = useState("dateasc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
 const userId = getUserId();
  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `https://demoadmin.databyte.app/api/ImageContainer/GetAll?UserId=${userId}&Page=${page}&ShowMore.Take=${itemsPerPage}&OrderBy=${orderBy}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      
      const data = await response.json();
      console.log(data.images)
      if (data && data[0]) {
        setImages(data.images);
        setTotalPages(Math.ceil(data.totalImageCount / itemsPerPage));
      }
    } catch (error) {
      toast.error("Failed to load images");
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, orderBy]);

  const handleUpload = async (file) => {
    try {
      setUploadLoading(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("Images", file);

      const response = await fetch(
        "https://demoadmin.databyte.app/api/ImageContainer/add-image-from-text-editor",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.isSuccess) {
        toast.success("Image uploaded successfully");
        fetchImages(); // Refresh the image list
        return result.images[0]; // Return the uploaded image data
      } else {
        throw new Error(result.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      const token = getToken();

      // Using FormData instead of JSON for DELETE request
      const formData = new FormData();
      formData.append("Id", imageId);

      const response = await fetch(
        "https://demoadmin.databyte.app/api/ImageContainer",
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            // Do not set Content-Type for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.isSuccess) {
        toast.success("Image deleted successfully");
        fetchImages(); // Refresh the image list
      } else {
        throw new Error(result.message || "Failed to delete image");
      }
    } catch (error) {
      toast.error("Failed to delete image");
      console.error("Error deleting image:", error);
    }
  };

  const filteredImages = images.filter((img) =>
    img.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalClose = () => {
    if (!uploadLoading) {
      setShowUploadModal(false);
    }
  };

  const handleCloseEntireModal = () => {
    if (typeof onCancel === "function") {
      onCancel();
    }
  };

  const handleUploadModalClose = () => {
    if (!uploadLoading) {
      setShowUploadModal(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Image Library</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCloseEntireModal}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-lg hover:bg-[#127D74] transition"
          >
            <ImagePlus size={18} />
            <span>Upload New</span>
          </button>
        </div>
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
          {filteredImages.length > 0 ? (
            filteredImages.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  selectedImage?.id === image.id
                    ? "border-[#0AAC9E]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image.newsImageUrls[0].replace(
                    "https://100.42.179.27:7298/imagecontainer/",
                    "https://demoadmin.databyte.app/uploads/imagecontainer/"
                  )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="text-white text-xs truncate">
                    {image.fileName || "Untitled"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full h-40 flex items-center justify-center text-gray-500">
              No images found. Try changing search criteria or upload a new
              image.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-[#0AAC9E] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <button
                onClick={handleUploadModalClose}
                disabled={uploadLoading}
                className={`text-gray-500 hover:text-gray-700 ${
                  uploadLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {uploadLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader className="h-12 w-12 text-[#0AAC9E] animate-spin" />
                  <p className="mt-4 text-sm text-gray-500">
                    Uploading image...
                  </p>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const uploadedImage = await handleUpload(file);
                        if (uploadedImage) {
                          // Only close the upload modal, not the entire image library
                          setShowUploadModal(false);

                          // Don't select the image yet, keep the image library open
                          // We'll let the user select it from the grid
                        }
                        // Clear file input value
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }
                    }}
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                </label>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUploadModalClose}
                disabled={uploadLoading}
                className={`px-4 py-2 mr-2 rounded border border-gray-300 text-gray-700 
                  ${
                    uploadLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageContainer;
