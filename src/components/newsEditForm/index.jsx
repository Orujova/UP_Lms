import { useState, useEffect } from 'react';
import InputComponent from '../inputComponent';
import SelectComponent from '../selectComponent';
import Link from 'next/link';
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";
import './newsEditForm.scss';
import PageTextComponent from '../pageTextComponent';

// Target group options
const TARGET_GROUPS = [
  { id: 'STAFF', name: 'Staff' },
  { id: 'STUDENT', name: 'Student' },
  { id: 'ALL', name: 'All' }
];

// Priority options
const PRIORITY_OPTIONS = [
  { id: 'HIGH', name: 'High' },
  { id: 'MEDIUM', name: 'Medium' },
  { id: 'LOW', name: 'Low' }
];

export default function NewsEditForm({ newsData, selectedImage }) {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    id: newsData?.id || '',
    title: newsData?.title || '',
    subTitle: newsData?.subTitle || '',
    category: newsData?.category || '',
    priority: newsData?.priority || 'MEDIUM',
    targetGroup: newsData?.targetGroup || 'ALL',
    newsCategoryId: newsData?.newsCategoryId || '',
    newsImages: selectedImage ? [selectedImage] : null,
  });

  // Parse description safely
  const parseDescription = (desc) => {
    if (!desc) return null;
    try {
      return JSON.parse(desc);
    } catch (error) {
      console.error('Error parsing description:', error);
      return null;
    }
  };

  const [description, setDescription] = useState(parseDescription(newsData?.description));
  const newsCategory = useSelector((state) => state.newsCategory.data) || [];

  // Update form data when newsData changes
  useEffect(() => {
    if (newsData) {
      setFormData({
        id: newsData.id || '',
        title: newsData.title || '',
        subTitle: newsData.subTitle || '',
        category: newsData.category || '',
        priority: newsData.priority || 'MEDIUM',
        targetGroup: newsData.targetGroup || 'ALL',
        newsCategoryId: newsData.newsCategoryId || '',
        newsImages: selectedImage ? [selectedImage] : null,
      });
      setDescription(parseDescription(newsData.description));
    }
  }, [newsData, selectedImage]);

  useEffect(() => {
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      toast.error("Authorization token is missing. Please login again.");
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.subTitle || !formData.newsCategoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const queryParams = new URLSearchParams({
      Id: formData.id,
      Title: formData.title,
      SubTitle: formData.subTitle,
      Description: JSON.stringify(description),
      Priority: formData.priority,
      TargetGroup: formData.targetGroup,
      NewsCategoryId: formData.newsCategoryId,
    });

    const url = `https://bravoadmin.uplms.org/api/News?${queryParams}`;

    const formDataToSend = new FormData();
    if (formData.newsImages?.[0] instanceof File) {
      formDataToSend.append('NewsImages', formData.newsImages[0]);
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update news');
      }

      toast.success("News updated successfully");
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error(error.message || 'Failed to update news');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="newsEditForm">
      <div className="inputs">
        <InputComponent
          text="Title"
          required
          className="col6"
          type="text"
          placeholder="Enter news title"
          value={formData.title}
          onChange={handleChange}
          name="title"
        />
        <InputComponent
          text="Subtitle"
          required
          className="col6"
          type="text"
          placeholder="Enter subtitle"
          value={formData.subTitle}
          onChange={handleChange}
          name="subTitle"
        />
        <SelectComponent
          required
          className="col6"
          text="Category"
          value={formData.newsCategoryId}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            category: e.target.value,
            newsCategoryId: e.target.value
          }))}
          options={newsCategory}
          name="category"
        />
        <SelectComponent
          required
          className="col6"
          text="Target Group"
          value={formData.targetGroup}
          onChange={handleChange}
          options={TARGET_GROUPS}
          name="targetGroup"
        />
        <SelectComponent
          required
          className="col6"
          text="Priority"
          value={formData.priority}
          onChange={handleChange}
          options={PRIORITY_OPTIONS}
          name="priority"
        />
        <div className="descriptionEditor">
          <label>Body</label>
          <PageTextComponent
            desc={description}
            onChange={handleDescriptionChange}
          />
        </div>
      </div>
      <div className="formButtons">
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
        <Link 
          className="backButton px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" 
          href={`/admin/dashboard/news/${formData.id}/`}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}