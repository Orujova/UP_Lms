"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ClipboardList,
  Vote,
  FormInput,
  AlertCircle,
} from "lucide-react";

const PollUnitsList = () => {
  const [pollUnits, setPollUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchPollUnits();
  }, []);

  const fetchPollUnits = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/PollUnit?Page=1&ShowMore.Take=10"
      );
      const data = await response.json();
      setPollUnits(data[0].pollUnits);
    } catch (error) {
      console.error("Error fetching poll units:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentCount = (unit) => ({
    surveys: unit.surveys.length,
    votes: unit.voteQuestions.length,
    forms: unit.formFields.length,
  });

  const filteredUnits = pollUnits.filter((unit) => {
    const matchesSearch =
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    const counts = getContentCount(unit);
    return matchesSearch && counts[filter] > 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading poll units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Poll Units</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search poll units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="surveys">Surveys</option>
              <option value="votes">Votes</option>
              <option value="forms">Forms</option>
            </select>
            <button
              onClick={() => router.push("/admin/dashboard/poll-unit/add")}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredUnits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No poll units found. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => {
              const counts = getContentCount(unit);
              const hasContent =
                counts.surveys > 0 || counts.votes > 0 || counts.forms > 0;

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2
                          onClick={() =>
                            router.push(`/admin/dashboard/poll-unit/${unit.id}`)
                          }
                          className="text-lg font-semibold text-gray-900 hover:text-emerald-600 cursor-pointer mb-2"
                        >
                          {unit.title}
                        </h2>
                        <p className="text-gray-600 mb-4">{unit.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedUnit(
                            expandedUnit === unit.id ? null : unit.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50"
                      >
                        {expandedUnit === unit.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {hasContent ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {counts.surveys > 0 && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm">
                            <ClipboardList className="w-4 h-4" />
                            {counts.surveys}
                          </div>
                        )}
                        {counts.votes > 0 && (
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                            <Vote className="w-4 h-4" />
                            {counts.votes}
                          </div>
                        )}
                        {counts.forms > 0 && (
                          <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                            <FormInput className="w-4 h-4" />
                            {counts.forms}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-4">
                        No content added yet
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                      {/* <button
                        onClick={() => router.push(`/admin/dashboard/poll-unit/edit/${unit.id}`)}
                        className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50"
                      >
                        <Edit className="w-5 h-5" />
                      </button> */}
                      <button
                        onClick={() =>
                          router.push(`/admin/dashboard/poll-unit/${unit.id}`)
                        }
                        className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedUnit === unit.id && hasContent && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {counts.surveys > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            {counts.surveys} Survey{counts.surveys !== 1 && "s"}
                            :
                            <span className="text-gray-600 font-normal">
                              {unit.surveys.map((s) => s.title).join(", ")}
                            </span>
                          </p>
                        </div>
                      )}
                      {counts.votes > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Vote className="w-4 h-4" />
                            {counts.votes} Vote Question
                            {counts.votes !== 1 && "s"}
                          </p>
                        </div>
                      )}
                      {counts.forms > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-purple-600 flex items-center gap-2">
                            <FormInput className="w-4 h-4" />
                            {counts.forms} Form{counts.forms !== 1 && "s"}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          router.push(`/admin/dashboard/poll-unit/${unit.id}`)
                        }
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        View full details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollUnitsList;
