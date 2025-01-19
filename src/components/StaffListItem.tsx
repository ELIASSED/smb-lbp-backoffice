// components/StaffListItem.tsx
"use client";

import React from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Staff } from "@/services/staffApi";

interface StaffListItemProps {
  staff: Staff;
  onEdit: () => void;
  onDelete: () => void;
}

export const StaffListItem: React.FC<StaffListItemProps> = ({
  staff,
  onEdit,
  onDelete,
}) => {
  return (
    <li className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">
            {staff.firstName} {staff.lastName}
          </div>
          <div className="text-sm text-gray-600">
            Numéro Agrément Ants: {staff.numeroAutorisationPrefectorale}
          </div>
          <div className="text-sm text-gray-600">Email: {staff.email}</div>
          <div className="text-sm text-gray-600">Téléphone: {staff.phone}</div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Modifier"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Supprimer"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </li>
  );
};
