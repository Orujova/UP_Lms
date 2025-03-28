"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import AddButton from "@/components/addButton";
import TargetGroupsComponent from "@/components/targetGroupsComponent";
import { Users } from "lucide-react";

export default function TargetPage() {
  const dispatch = useDispatch();
  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]) || [];

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 leading-tight">
          <div className="flex justify-between items-center">
            {/* Counter Section */}
            <div className="flex items-center gap-3">
              <div className="bg-[#e6fbf9] p-2 rounded-md">
                <Users className="w-4 h-4 text-[#0AAC9E]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-gray-900">
                  {targetGroups.totalTargetGroupCount || 0}
                </span>
                <span className="text-gray-500 text-sm">
                  Target Groups in Total
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center">
              <AddButton
                text="Add new target"
                link="/admin/dashboard/targets/add"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 leading-tight">
          <TargetGroupsComponent data={targetGroups.targetGroups} />
        </div>
      </div>
    </div>
  );
}
