'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Folder, 
  Tag, 
  Award, 
  Layers,
  Plus,
  ChevronRight,
  BookOpen,
  Hash,
  Trophy,
  Network
} from 'lucide-react';

const CourseSettingsPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(null);

  const settingsItems = [
    {
      id: 'categories',
      title: 'Course Categories',
      description: 'Organize courses by categories',
      icon: Folder,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      count: '4 categories',
      path: '/admin/dashboard/courses/categories'
    },
    {
      id: 'tags',
      title: 'Course Tags',
      description: 'Create and manage course tags',
      icon: Tag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      count: '12 tags',
      path: '/admin/dashboard/courses/tags'
    },
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Manage course certificates',
      icon: Award,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      count: '3 templates',
      path: '/admin/dashboard/certificates'
    },
    {
      id: 'clusters',
      title: 'Course Clusters',
      description: 'Group related courses together',
      icon: Layers,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      count: '2 clusters',
      path: '/admin/dashboard/clusters'
    }
  ];

  const quickActions = [
    {
      title: 'Add Category',
      description: 'Create a new course category',
      icon: Folder,
      action: () => router.push('/admin/dashboard/courses/categories?action=create')
    },
    {
      title: 'Add Tag',
      description: 'Create a new course tag',
      icon: Hash,
      action: () => router.push('/admin/dashboard/courses/tags?action=create')
    },
    {
      title: 'New Certificate',
      description: 'Create a certificate template',
      icon: Trophy,
      action: () => router.push('/admin/dashboard/certificates?action=create')
    },
    {
      title: 'Create Cluster',
      description: 'Group courses into clusters',
      icon: Network,
      action: () => router.push('/admin/dashboard/clusters?action=create')
    }
  ];

  const handleItemClick = (item) => {
    router.push(item.path);
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
                  <h1 className="text-lg font-semibold text-gray-900">Course Settings</h1>
                  <p className="text-sm text-gray-500">Manage course categories, tags, and configurations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#0AAC9E]/30 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#0AAC9E]/10 rounded-lg group-hover:bg-[#0AAC9E]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-[#0AAC9E] transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#0AAC9E] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setActiveSection(item.id)}
                onMouseLeave={() => setActiveSection(null)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${item.bgColor} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-6 h-6 ${item.textColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0AAC9E] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 mb-3">{item.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`px-2 py-1 ${item.bgColor} ${item.textColor} rounded-full text-xs font-medium`}>
                            {item.count}
                          </span>
                          <span className="text-gray-500">Click to manage</span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0AAC9E] group-hover:translate-x-1 transition-all duration-200" />
                  </div>

                  {/* Preview content when hovered */}
                  {activeSection === item.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {item.id === 'categories' ? '4' : item.id === 'tags' ? '12' : item.id === 'certificates' ? '3' : '2'}
                          </div>
                          <div className="text-xs text-gray-500">Total Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0AAC9E]">
                            {item.id === 'categories' ? '24' : item.id === 'tags' ? '156' : item.id === 'certificates' ? '89' : '45'}
                          </div>
                          <div className="text-xs text-gray-500">Usage Count</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className={`px-6 py-3 ${item.bgColor} border-t border-gray-100 group-hover:bg-[#0AAC9E]/5 transition-colors`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${item.textColor} group-hover:text-[#0AAC9E]`}>
                      Manage {item.title}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">View All</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Created', item: 'Web Development category', time: '2 hours ago', type: 'category' },
                { action: 'Updated', item: 'JavaScript tag', time: '5 hours ago', type: 'tag' },
                { action: 'Added', item: 'Excellence Certificate template', time: '1 day ago', type: 'certificate' },
                { action: 'Modified', item: 'Frontend Development cluster', time: '2 days ago', type: 'cluster' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'category' ? 'bg-blue-100' :
                    activity.type === 'tag' ? 'bg-green-100' :
                    activity.type === 'certificate' ? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'category' ? <Folder className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'tag' ? <Tag className="w-4 h-4 text-green-600" /> :
                     activity.type === 'certificate' ? <Award className="w-4 h-4 text-yellow-600" /> :
                     <Layers className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span> {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsPage;