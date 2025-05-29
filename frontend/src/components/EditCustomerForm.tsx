import React, { useState, useEffect } from 'react';
import { type Customer, type CustomerUpdate, updateCustomer } from '../services/api.services';

interface EditCustomerFormProps {
  customer: Customer;
  onCustomerUpdated: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, onCustomerUpdated, onCancel }) => {
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [age, setAge] = useState(customer.age.toString()); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect to update form fields if the customer prop changes (e.g., if another customer is selected for editing)
  useEffect(() => {
    setName(customer.name);
    setEmail(customer.email);
    setAge(customer.age.toString());
    setError(null);
  }, [customer]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      setError('Please enter a valid age.');
      setIsLoading(false);
      return;
    }

    // Construct the update data - only include fields that have changed.
    const customerUpdateData: CustomerUpdate = {};
    if (name !== customer.name) customerUpdateData.name = name;
    if (email !== customer.email) customerUpdateData.email = email;
    if (ageNumber !== customer.age) customerUpdateData.age = ageNumber;

    if (Object.keys(customerUpdateData).length === 0) {
      setError("No changes detected.");
      setIsLoading(false);
      onCancel(); 
      return;
    }


    try {
      const updatedCustomerData = await updateCustomer(customer.id, customerUpdateData);
      onCustomerUpdated(updatedCustomerData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while updating the customer.');
      }
      console.error("Failed to update customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Edit Customer: {customer.name}</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-name" className="block mb-1 text-sm font-medium text-gray-600">Name:</label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-email" className="block mb-1 text-sm font-medium text-gray-600">Email:</label>
            <input
              type="email"
              id="edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-age" className="block mb-1 text-sm font-medium text-gray-600">Age:</label>
            <input
              type="number"
              id="edit-age"
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
              {isLoading ? 'Saving...' : 'Saved Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerForm;