import React, { useState } from 'react';
import { type CustomerCreate, createCustomer } from '../services/api.services';

interface AddCustomerFormProps {
  onCustomerAdded: () => void;
  onCancel: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onCustomerAdded, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!name.trim() || !email.trim() || !age.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 120) {
      setError('Please enter a valid age (1-120).');
      setIsLoading(false);
      return;
    }

    const customerData: CustomerCreate = { name: name.trim(), email: email.trim(), age: ageNumber };

    try {
      await createCustomer(customerData);
      onCustomerAdded();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while creating the customer.');
      }
      console.error("Failed to create customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="p-6 bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Customer</h2>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            aria-label="Close form"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-300" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="add-name" className="block mb-1.5 text-sm font-medium text-gray-700">Name</label>
            <input
              type="text" id="add-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              disabled={isLoading} required
            />
          </div>
          <div>
            <label htmlFor="add-email" className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" id="add-email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              disabled={isLoading} required
            />
          </div>
          <div>
            <label htmlFor="add-age" className="block mb-1.5 text-sm font-medium text-gray-700">Age</label>
            <input
              type="number" id="add-age" value={age} onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              disabled={isLoading} required min="1" max="120"
            />
          </div>
          <div className="flex justify-end pt-3 space-x-3">
            <button
              type="button" onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;