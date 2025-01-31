import { useState } from 'react';
import { ChevronDown, Users, ClipboardList } from 'lucide-react';

export default function TargetGroupsComponent({ data = [] }) {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [userDetails, setUserDetails] = useState({});

    const handleToggle = async (groupId) => {
        if (expandedGroup === groupId) {
            setExpandedGroup(null);
        } else {
            setExpandedGroup(groupId);
            if (!userDetails[groupId]) {
                await fetchUserDetails(groupId);
            }
        }
    };

    const fetchUserDetails = async (groupId) => {
        try {
            const response = await fetch(
                `https://bravoadmin.uplms.org/api/TargetGroup/GetFilteredUsersByTargetGroupId?Page=1&TargetGroupId=${groupId}`,
                {
                    method: 'GET',
                    headers: { accept: '*/*' },
                }
            );

            if (!response.ok) throw new Error(`Failed to fetch data. Status: ${response.status}`);

            const data = await response.json();
            setUserDetails((prev) => ({
                ...prev,
                [groupId]: data?.[0]?.appUsers || []
            }));
        } catch (error) {
            console.error(`Failed to fetch user details for group ${groupId}:`, error);
        }
    };

    return (
        <div className="w-full bg-white rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Target Groups</h2>

            </div>

            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg font-semibold text-gray-600">
                <div>Group Name</div>
                <div>Number of Users</div>
                <div className="text-right">Actions</div>
            </div>

            {/* Group List */}
            <div className="divide-y divide-gray-100">
                {Array.isArray(data) && data.length > 0 ? (
                    data.map((target, index) => (
                        <div key={index} className="transition-all duration-200">
                            {/* Group Row */}
                            <div className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                                <div className="font-medium text-gray-800">{target.name || 'Unnamed Group'}</div>
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{target.userCount || 0}</span>
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={() => handleToggle(target.id)}
                                        className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 
                                            ${expandedGroup === target.id ? 'transform rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* User Details Section */}
                            {expandedGroup === target.id && (
                                <div className="bg-gray-50 px-6 py-4 rounded-lg mb-4">
                                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-semibold text-gray-600">
                                        <div>Name</div>
                                        <div>Phone</div>
                                        <div>Department</div>
                                        <div>Position</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {userDetails[target.id]?.length > 0 ? (
                                            userDetails[target.id].map((user) => (
                                                <div key={user.id} 
                                                    className="grid grid-cols-4 gap-4 px-4 py-2 bg-white rounded-lg text-sm">
                                                    <div className="font-medium text-gray-800">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-gray-600">{user.phoneNumber}</div>
                                                    <div className="text-gray-600">{user.departmentName}</div>
                                                    <div className="text-gray-600">{user.positionName}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                No users found for this group.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No target groups available
                    </div>
                )}
            </div>
        </div>
    );
}