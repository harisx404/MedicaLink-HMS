import React from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { useGetWardHandoversQuery } from '../nursingApi';
import { FileText, ArrowRight, User } from 'lucide-react';

export const ShiftHandover: React.FC = () => {
  // Using a mock ward ID for the demo since the nurse would be assigned to a ward
  const { data: handoverData, isLoading } = useGetWardHandoversQuery('666abcd1234567890abcdef0');
  
  const handovers = handoverData?.data || [];

  return (
    <PageWrapper title="Shift Handover">
      <div className="space-y-6 animate-fade-in">
        <p className="text-gray-500 mb-6">End of shift reports and patient continuity</p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Handover Form */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 font-jakarta mb-4 border-b border-gray-100 pb-2">
            Submit New Handover
          </h2>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow">
                  <option>Morning (08:00 - 16:00)</option>
                  <option>Evening (16:00 - 00:00)</option>
                  <option>Night (00:00 - 08:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handing Over To</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow">
                  <option>Sarah Jenkins (RN)</option>
                  <option>Michael Chen (RN)</option>
                  <option>Emma Watson (RN)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">General Ward Status</label>
              <textarea 
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                placeholder="Briefly describe the overall status of the ward during this shift..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Critical Patients to Monitor</label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 flex flex-col items-center justify-center h-24 border-dashed">
                <span>Select patients from the ward list to add to critical watch.</span>
                <button type="button" className="mt-2 text-indigo-600 font-medium hover:text-indigo-800">Browse Patients</button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Submit Handover
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Handover History */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 font-jakarta mb-4 border-b border-gray-100 pb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Recent Handovers (Ward A)
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : handovers.length > 0 ? (
            <div className="space-y-4">
              {handovers.map((handover: any) => (
                <div key={handover._id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {new Date(handover.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(handover.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-900 mb-3">
                    <User className="w-4 h-4 text-gray-400 mr-1" /> {handover.shiftFrom?.firstName} {handover.shiftFrom?.lastName}
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                    <User className="w-4 h-4 text-gray-400 mr-1" /> {handover.shiftTo?.firstName} {handover.shiftTo?.lastName}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{handover.report}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No recent handovers found for this ward.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </PageWrapper>
  );
};
