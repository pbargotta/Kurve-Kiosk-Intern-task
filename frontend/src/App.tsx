import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer, updateCustomer, type Customer, type CustomerUpdate } from './services/api.services';
import AddCustomerForm from './components/AddCustomerForm';
import EditCustomerForm from './components/EditCustomerForm';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error("Failed to fetch customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers on initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handler for when a new customer is added
  const handleCustomerAdded = () => {
    setShowAddForm(false);
    fetchCustomers();
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
      setDeletingCustomerId(customerId);
      setError(null);
      try {
        await deleteCustomer(customerId);
        setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while deleting.';
        setError(`Failed to delete ${customerName}: ${errorMessage}`);
        console.error(`Failed to delete customer ${customerId}:`, err);
      } finally {
        setDeletingCustomerId(null);
      }
    }
  };

  const handleOpenEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleCloseEditForm = () => {
    setEditingCustomer(null);
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers(prevCustomers => prevCustomers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    setEditingCustomer(null);
  };

  // Show loading only on initial load
  if (isLoading && customers.length === 0) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Loading customers...</p>
      </div>
    );
  }

  // Initial error state handling
  if (error && customers.length === 0 && !deletingCustomerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl">Error loading customers:</p>
        <p>{error}</p>
        <button
          onClick={fetchCustomers}
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          Kurve Kiosk Customer Management
        </h1>
      </header>

      <div className="mb-6 text-center">
        <button
          className="px-4 py-2 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={() => setShowAddForm(true)} 
        >
          Add New Customer
        </button>
      </div>

      {/* Dipslay the AddCustomerForm when selected */}
      {showAddForm && (
        <AddCustomerForm
          onCustomerAdded={handleCustomerAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Conditionally display the EditCustomerForm when selected */}
      {editingCustomer && (
        <EditCustomerForm
          customer={editingCustomer}
          onCustomerUpdated={handleCustomerUpdated}
          onCancel={handleCloseEditForm}
        />
      )}
      
      {/* Displaying general errors or loading messages */}
      {isLoading && customers.length > 0 && <p className="text-center text-gray-600">Refreshing customers...</p>}
      {!isLoading && customers.length === 0 && !error && (
        <p className="text-center text-gray-600">No customers found. Click "Add New Customer" to begin.</p>
      )}

      {/* Customer table */}
      {customers.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              {/* Table Headers */}
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">ID</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Name</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Age</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Email</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* Table cells for id, name, age, email */}
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">{customer.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">{customer.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">{customer.age}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">{customer.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {/* Edit & Delete buttons */}
                    <button
                      className="mr-2 text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleOpenEditForm(customer)}
                      disabled={deletingCustomerId === customer.id || !!editingCustomer}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                      disabled={deletingCustomerId === customer.id}
                    >
                      {deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;