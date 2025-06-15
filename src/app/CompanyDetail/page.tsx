"use client";

import { useState } from "react";
import {
  FaTrash,
  FaPlus,
  FaBuilding,
  FaSitemap,
  FaUsers,
} from "react-icons/fa";

// Mock data untuk demonstrasi
const mockSubscriptionInfo = {
  current_branch_count: 2,
  max_branches: 5,
  remaining_branches: 3,
};

type Position = {
  name: string;
  description: string;
};

type Division = {
  name: string;
  description: string;
  positions: Position[];
};

type Branch = {
  name: string;
  branch_address: string;
  branch_phone: string;
  branch_phone_backup: string;
  description: string;
  divisions: Division[];
};

export default function CompanyDetailPage() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      name: "",
      branch_address: "",
      branch_phone: "",
      branch_phone_backup: "",
      description: "",
      divisions: [
        {
          name: "",
          description: "",
          positions: [
            {
              name: "",
              description: "",
            },
          ],
        },
      ],
    },
  ]);

  const [subscriptionInfo, setSubscriptionInfo] =
    useState(mockSubscriptionInfo);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBranchChange = (
    branchIndex: number,
    field:
      | "name"
      | "branch_address"
      | "branch_phone"
      | "branch_phone_backup"
      | "description",
    value: string
  ) => {
    const updated = [...branches];
    updated[branchIndex][field] = value;
    setBranches(updated);
  };

  const addBranch = () => {
    if (subscriptionInfo && branches.length >= subscriptionInfo.max_branches) {
      alert(
        `You can only create maximum ${subscriptionInfo.max_branches} branches based on your subscription plan.`
      );
      return;
    }

    setBranches([
      ...branches,
      {
        name: "",
        branch_address: "",
        branch_phone: "",
        branch_phone_backup: "",
        description: "",
        divisions: [
          {
            name: "",
            description: "",
            positions: [
              {
                name: "",
                description: "",
              },
            ],
          },
        ],
      },
    ]);
  };

  const removeBranch = (branchIndex: number) => {
    if (branches.length <= 1) {
      alert("At least one branch is required");
      return;
    }
    setBranches(branches.filter((_, i) => i !== branchIndex));
  };

  const handleDivisionChange = (
    branchIndex: number,
    divisionIndex: number,
    field: keyof Division,
    value: string
  ) => {
    const updated = [...branches];
    if (field !== "positions") {
      updated[branchIndex].divisions[divisionIndex][field] = value;
    }
    setBranches(updated);
  };

  const addDivision = (branchIndex: number) => {
    const updated = [...branches];
    updated[branchIndex].divisions.push({
      name: "",
      description: "",
      positions: [
        {
          name: "",
          description: "",
        },
      ],
    });
    setBranches(updated);
  };

  const removeDivision = (branchIndex: number, divisionIndex: number) => {
    const updated = [...branches];
    if (updated[branchIndex].divisions.length <= 1) {
      alert("At least one division is required per branch");
      return;
    }
    updated[branchIndex].divisions = updated[branchIndex].divisions.filter(
      (_, i) => i !== divisionIndex
    );
    setBranches(updated);
  };

  const handlePositionChange = (
    branchIndex: number,
    divisionIndex: number,
    positionIndex: number,
    field: keyof Position,
    value: string
  ) => {
    const updated = [...branches];
    updated[branchIndex].divisions[divisionIndex].positions[positionIndex][
      field
    ] = value;
    setBranches(updated);
  };

  const addPosition = (branchIndex: number, divisionIndex: number) => {
    const updated = [...branches];
    updated[branchIndex].divisions[divisionIndex].positions.push({
      name: "",
      description: "",
    });
    setBranches(updated);
  };

  const removePosition = (
    branchIndex: number,
    divisionIndex: number,
    positionIndex: number
  ) => {
    const updated = [...branches];
    if (updated[branchIndex].divisions[divisionIndex].positions.length <= 1) {
      alert("At least one position is required per division");
      return;
    }
    updated[branchIndex].divisions[divisionIndex].positions = updated[
      branchIndex
    ].divisions[divisionIndex].positions.filter((_, i) => i !== positionIndex);
    setBranches(updated);
  };

  const validateForm = () => {
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      if (!branch.name.trim()) {
        alert(`Branch ${i + 1}: Name is required`);
        return false;
      }
      if (!branch.branch_address.trim()) {
        alert(`Branch ${i + 1}: Address is required`);
        return false;
      }
      if (!branch.branch_phone.trim()) {
        alert(`Branch ${i + 1}: Phone is required`);
        return false;
      }

      if (!branch.divisions || branch.divisions.length === 0) {
        alert(`Branch ${i + 1}: At least one division is required`);
        return false;
      }

      for (let j = 0; j < branch.divisions.length; j++) {
        const division = branch.divisions[j];
        if (!division.name.trim()) {
          alert(`Branch ${i + 1}, Division ${j + 1}: Name is required`);
          return false;
        }

        if (!division.positions || division.positions.length === 0) {
          alert(
            `Branch ${i + 1}, Division ${
              j + 1
            }: At least one position is required`
          );
          return false;
        }

        for (let k = 0; k < division.positions.length; k++) {
          const position = division.positions[k];
          if (!position.name.trim()) {
            alert(
              `Branch ${i + 1}, Division ${j + 1}, Position ${
                k + 1
              }: Name is required`
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Company details saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving company details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Simulate router back
    console.log("Going back...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Company Detail
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base mb-4">
            Help us get started by providing your company&apos;s basic
            information.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center space-x-8 mb-12">
          {["Company Profile", "Package", "Checkout", "Company Detail"].map(
            (label, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-200 ${
                      index === 3
                        ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-lg"
                        : "bg-white text-[#1E3A5F] border-[#1E3A5F]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm mt-2 text-gray-600 w-24 text-center font-medium">
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-4 rounded-full ${
                      index === 3 ? "bg-[#1E3A5F]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
        {/* Subscription Info */}
        {subscriptionInfo && (
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium shadow-sm">
            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <svg
                className="w-3 h-3 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-semibold">
              {subscriptionInfo.max_branches}
            </span>
            <span className="ml-1 opacity-80">branches available</span>
          </div>
        )}
      </div>

      {/* Branches Section */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {branches.map((branch, branchIndex) => (
          <div
            key={branchIndex}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* Branch Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FaBuilding className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Branch {branchIndex + 1}
                  </h2>
                </div>
                <button
                  onClick={() => removeBranch(branchIndex)}
                  disabled={branches.length <= 1}
                  className={`p-2 rounded-md transition-colors ${
                    branches.length <= 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Branch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={branch.name}
                    onChange={(e) =>
                      handleBranchChange(branchIndex, "name", e.target.value)
                    }
                    placeholder="Enter branch name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Phone *
                  </label>
                  <input
                    type="text"
                    value={branch.branch_phone}
                    onChange={(e) =>
                      handleBranchChange(
                        branchIndex,
                        "branch_phone",
                        e.target.value
                      )
                    }
                    placeholder="Enter branch phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Address *
                  </label>
                  <textarea
                    value={branch.branch_address}
                    onChange={(e) =>
                      handleBranchChange(
                        branchIndex,
                        "branch_address",
                        e.target.value
                      )
                    }
                    placeholder="Enter branch address"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Phone
                  </label>
                  <input
                    type="text"
                    value={branch.branch_phone_backup || ""}
                    onChange={(e) =>
                      handleBranchChange(
                        branchIndex,
                        "branch_phone_backup",
                        e.target.value
                      )
                    }
                    placeholder="Enter backup phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={branch.description || ""}
                    onChange={(e) =>
                      handleBranchChange(
                        branchIndex,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Enter branch description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Divisions */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <FaSitemap className="text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-800">
                      Divisions
                    </h3>
                  </div>
                  <button
                    onClick={() => addDivision(branchIndex)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FaPlus size={12} className="mr-1" /> Add Division
                  </button>
                </div>

                <div className="space-y-4">
                  {branch.divisions.map((division, divisionIndex) => (
                    <div
                      key={divisionIndex}
                      className="border border-gray-200 rounded-md p-4 bg-gray-50"
                    >
                      {/* Division Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700">
                          Division {divisionIndex + 1}
                        </h4>
                        <button
                          onClick={() =>
                            removeDivision(branchIndex, divisionIndex)
                          }
                          disabled={branch.divisions.length <= 1}
                          className={`p-1 rounded text-xs ${
                            branch.divisions.length <= 1
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      {/* Division Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Division Name *
                          </label>
                          <input
                            type="text"
                            value={division.name}
                            onChange={(e) =>
                              handleDivisionChange(
                                branchIndex,
                                divisionIndex,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter division name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={division.description || ""}
                            onChange={(e) =>
                              handleDivisionChange(
                                branchIndex,
                                divisionIndex,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter division description"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Positions */}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-1">
                            <FaUsers className="text-gray-500 text-sm" />
                            <h5 className="text-sm font-medium text-gray-600">
                              Positions
                            </h5>
                          </div>
                          <button
                            onClick={() =>
                              addPosition(branchIndex, divisionIndex)
                            }
                            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <FaPlus size={10} className="mr-1" /> Add Position
                          </button>
                        </div>

                        <div className="space-y-2">
                          {division.positions.map((position, positionIndex) => (
                            <div
                              key={positionIndex}
                              className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={position.name}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      branchIndex,
                                      divisionIndex,
                                      positionIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Position name"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={position.description || ""}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      branchIndex,
                                      divisionIndex,
                                      positionIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Position description"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <button
                                onClick={() =>
                                  removePosition(
                                    branchIndex,
                                    divisionIndex,
                                    positionIndex
                                  )
                                }
                                disabled={division.positions.length <= 1}
                                className={`p-1 rounded text-xs ${
                                  division.positions.length <= 1
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={addBranch}
          disabled={
            subscriptionInfo
              ? branches.length >= subscriptionInfo.max_branches
              : false
          }
          className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
            subscriptionInfo && branches.length >= subscriptionInfo.max_branches
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <FaPlus size={16} className="mr-2" /> Add New Branch
          {subscriptionInfo &&
            branches.length >= subscriptionInfo.max_branches && (
              <span className="ml-2 text-sm">(Limit reached)</span>
            )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
          onClick={handleBack}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isSubmitting
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </div>
          ) : (
            "Save Company Details"
          )}
        </button>
      </div>
    </div>
  );
}
