import React, { useState } from 'react';
import { populateDatabase, clearDatabase } from '../services/api.services';

interface DevToolsProps {
  onActionComplete: () => void;
}

const DevTools: React.FC<DevToolsProps> = ({ onActionComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [numRecordsToPopulate, setNumRecordsToPopulate] = useState<number>(10000);

  const handlePopulate = async () => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await populateDatabase(numRecordsToPopulate);
      setMessage(response.message);
      onActionComplete();
    } catch (err) {
      setIsError(true);
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unknown error occurred during population.');
      }
      console.error("Population error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you SURE you want to clear ALL customer data? This is irreversible.")) {
        return;
    }
    setIsLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await clearDatabase();
      setMessage(response.message);
      onActionComplete();
    } catch (err) {
      setIsError(true);
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unknown error occurred while clearing the database.');
      }
      console.error("Clear DB error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 mt-10 bg-gray-100 border-t border-gray-300 rounded-b-lg">
      <h4 className="mb-3 text-lg font-semibold text-gray-700">Developer Utilities</h4>
      {message && (
        <div className={`p-3 mb-3 text-sm rounded-md ${isError ? 'text-red-700 bg-red-100 border border-red-300' : 'text-green-700 bg-green-100 border border-green-300'}`}>
          {message}
        </div>
      )}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePopulate}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
          {isLoading ? 'Processing...' : `Populate DB (${numRecordsToPopulate})`}
          </button>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="numRecords" className="mr-2 text-sm text-gray-600">Records:</label>
          <input 
            type="number" 
            id="numRecords"
            value={numRecordsToPopulate}
            onChange={(e) => setNumRecordsToPopulate(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="50000"
            className="w-24 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleClear}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-700 rounded-md hover:bg-red-800 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Clear Database'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        These tools are for testing and demonstration. Use with caution.
      </p>
    </div>
  );
};

export default DevTools;