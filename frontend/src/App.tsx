import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer, type Customer, type PaginatedCustomersResponse } from './services/api.services';
import AddCustomerForm from './components/AddCustomerForm';
import EditCustomerForm from './components/EditCustomerForm';

const ITEMS_PER_PAGE = 10;

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (page: number = currentPage) => {
    setIsLoading(true); // Set loading true at the start of fetch
    setError(null); // Clear previous errors
    const skip = (page - 1) * ITEMS_PER_PAGE;
    try {
      const data: PaginatedCustomersResponse = await getCustomers(skip, ITEMS_PER_PAGE);
      setCustomers(data.records);
      setTotalCustomers(data.total);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCustomers([]);
      setTotalCustomers(0);
      console.error("Failed to fetch customers:", err);
    } finally {
      setIsLoading(false); 
    }
  };

  // Fetch customers on initial load and when currentPage changes
  useEffect(() => {
    fetchCustomers(currentPage);
  }, []);

  // Handler for when a new customer is added
  const handleCustomerAdded = () => {
    setShowAddForm(false);
    const newTotalPages = Math.ceil((totalCustomers + 1) / ITEMS_PER_PAGE);
    fetchCustomers(newTotalPages);
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
      setDeletingCustomerId(customerId);
      setError(null);
      try {
        await deleteCustomer(customerId);
        let pageToFetch = currentPage;
        if (customers.length === 1 && currentPage > 1) {
          pageToFetch = currentPage - 1;
        }
        fetchCustomers(pageToFetch);
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchCustomers(newPage);
    }
  };

  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

  // Initial loading state for the very first fetch
  if (isLoading && totalCustomers === 0 && currentPage === 1 && !error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-8">
          Kurve Kiosk Customer Management
        </h1>
        <p className="text-xl text-gray-700">Loading customers...</p>
      </div>
    );
  }

  // Initial error state handling (when no customers are loaded yet)
  if (error && customers.length === 0 && !deletingCustomerId && totalCustomers === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-red-500">
        <h1 className="text-4xl font-bold text-blue-700 mb-8">
          Kurve Kiosk Customer Management
        </h1>
        <p className="text-xl">Error loading customers:</p>
        <p>{error}</p>
        <button
          onClick={() => fetchCustomers(1)}
          className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
          disabled={isLoading}
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
      
      {/* Display general error if any, but not if it's an initial load error (handled above) */}
      {error && (customers.length > 0 || totalCustomers > 0) && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Display loading message if loading and there are already customers or it's not the first page */}
      {isLoading && (customers.length > 0 || currentPage > 1) && (
        <p className="py-4 text-center text-gray-600">Loading page {currentPage}...</p>
      )}
      
      {!isLoading && customers.length === 0 && !error && (
        <p className="py-10 text-center text-gray-600 text-lg">No customers found. Click "Add New Customer" to begin.</p>
      )}

      {customers.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.id} className={`border-b border-gray-200 hover:bg-gray-50 ${deletingCustomerId === customer.id ? 'opacity-50' : ''} ${isLoading ? 'cursor-wait' : ''}`}>
                    <td className="px-5 py-4 text-sm">{customer.id}</td>
                    <td className="px-5 py-4 text-sm">{customer.name}</td>
                    <td className="px-5 py-4 text-sm">{customer.age}</td>
                    <td className="px-5 py-4 text-sm">{customer.email}</td>
                    <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                      <button
                        className="mr-3 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                        onClick={() => handleOpenEditForm(customer)}
                        disabled={isLoading || deletingCustomerId === customer.id || !!editingCustomer}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        disabled={isLoading || deletingCustomerId === customer.id || !!editingCustomer} 
                      >
                        {deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-3">
              <span className="text-sm text-gray-700">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                <span className="ml-2">({totalCustomers} total records)</span>
              </span>
              <div className="inline-flex">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage <= 1 || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-4 py-2 -ml-px text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;