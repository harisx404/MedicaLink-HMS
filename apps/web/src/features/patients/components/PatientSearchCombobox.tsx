import React, { useState } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import { useGetPatientsQuery } from '../api/patientApi';
import { useDebounce } from '../../../hooks/useDebounce';
import type { SharedPatient } from '@medicalink/shared';

interface PatientSearchComboboxProps {
  onSelect: (patient: SharedPatient) => void;
  placeholder?: string;
}

export const PatientSearchCombobox: React.FC<PatientSearchComboboxProps> = ({ 
  onSelect, 
  placeholder = "Search by Name, UHID, or Phone..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isFetching } = useGetPatientsQuery(
    { q: debouncedSearch, limit: 5 },
    { skip: debouncedSearch.length < 2 }
  );

  const patients = data?.data || [];

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {!isFetching && patients.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No patients found.
            </div>
          ) : (
            <ul className="py-1">
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  onClick={() => {
                    onSelect(patient);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-xs text-gray-500 flex gap-2">
                      <span>{patient.uhid}</span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
