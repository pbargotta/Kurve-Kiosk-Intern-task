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
    if (!name || !email || !age) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      setError('Please enter a valid age.');
      setIsLoading(false);
      return;
    }

    const customerData: CustomerCreate = { name, email, age: ageNumber };

    try {
      await createCustomer(customerData);
      onCustomerAdded(); // Notify parent to refresh or update list
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Add New Customer</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-600">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-600">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="age" className="block mb-1 text-sm font-medium text-gray-600">Age:</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;