import { useState, useEffect, useRef } from 'react';
import { getCustomers, deleteCustomer, type Customer, type PaginatedCustomersResponse } from './services/api.services';
import AddCustomerForm from './components/AddCustomerForm';
import EditCustomerForm from './components/EditCustomerForm';
import Pagination from './components/Pagination';

const ITEMS_PER_PAGE = 10;
const MIN_LOADER_DISPLAY_TIME = 300; // milliseconds

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Differentiate initial load from subsequent page loads
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false); // For pagination/refresh loading

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const loaderTimerRef = useRef<number | null>(null);

  const fetchCustomers = async (page: number = currentPage) => {
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
    }
    setIsPageLoading(true);
    setError(null);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const startTime = Date.now();

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
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADER_DISPLAY_TIME) {
        loaderTimerRef.current = window.setTimeout(() => {
          setIsPageLoading(false);
          if (!isInitialLoadComplete) setIsInitialLoadComplete(true);
        }, MIN_LOADER_DISPLAY_TIME - elapsedTime);
      } else {
        setIsPageLoading(false);
        if (!isInitialLoadComplete) setIsInitialLoadComplete(true);
      }
    }
  };

  // Fetch customers on initial load
  useEffect(() => {
    fetchCustomers(1);
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
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isPageLoading) {
      fetchCustomers(newPage);
    }
  };

  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

  // Initial loading state for the very first fetch
  if (!isInitialLoadComplete && isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">
          Kurve Kiosk Customer Management
        </h1>
        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-gray-700 mt-4">Loading customers...</p>
      </div>
    );
  }

  // Initial error state handling (when no customers are loaded yet after initial attempt)
  if (!isInitialLoadComplete && error && customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-red-600">
        <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">
          Kurve Kiosk Customer Management
        </h1>
        <p className="text-xl font-semibold">Error loading customers:</p>
        <p className="text-center">{error}</p>
        <button
          onClick={() => fetchCustomers(1)} // Retry fetching the first page
          className="mt-6 px-5 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto min-h-screen bg-gray-50">
      <header className="mb-6 text-center py-6">
        <h1 className="text-4xl font-bold text-blue-700">
          Kurve Kiosk Customer Management
        </h1>
      </header>

      <div className="mb-8 text-center">
        <button
          className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={() => setShowAddForm(true)} 
          disabled={isPageLoading || !!editingCustomer}
        >
          Add New Customer
        </button>
      </div>

      {/* Display the AddCustomerForm when selected */}
      {showAddForm && (
        <AddCustomerForm
          onCustomerAdded={handleCustomerAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Display the EditCustomerForm when selected */}
      {editingCustomer && (
        <EditCustomerForm
          customer={editingCustomer}
          onCustomerUpdated={handleCustomerUpdated}
          onCancel={handleCloseEditForm}
        />
      )}
      
      {/* Display general error if any, but not if it's an initial load error (handled above) */}
      {error && isInitialLoadComplete && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md" role="alert">
            <p className="font-bold">An error occurred:</p>
            <p>{error}</p>
        </div>
      )}
      
      <div className="min-h-[300px] relative">
        {isPageLoading && isInitialLoadComplete && ( // Show subtle loader for subsequent loads
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10 rounded-lg">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {!isPageLoading && customers.length === 0 && isInitialLoadComplete && !error && (
          <p className="py-10 text-center text-gray-600 text-lg">No customers found. Click "Add New Customer" to begin.</p>
        )}

        {customers.length > 0 && (
          <>
            <div className={`overflow-x-auto bg-white rounded-lg shadow-lg ${isPageLoading ? 'opacity-75' : ''}`}>
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
                    <tr key={customer.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-opacity duration-150 ${deletingCustomerId === customer.id ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-4 text-sm">{customer.id}</td>
                      <td className="px-5 py-4 text-sm">{customer.name}</td>
                      <td className="px-5 py-4 text-sm">{customer.age}</td>
                      <td className="px-5 py-4 text-sm">{customer.email}</td>
                      <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                        <button
                          className="mr-3 font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                          onClick={() => handleOpenEditForm(customer)}
                          disabled={isPageLoading || deletingCustomerId === customer.id || !!editingCustomer || showAddForm}
                        >
                          Edit
                        </button>
                        <button
                          className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          disabled={isPageLoading || deletingCustomerId === customer.id || !!editingCustomer || showAddForm} 
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
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 py-3">
                <span className="text-sm text-gray-700 mb-3 sm:mb-0">
                  Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                  <span className="hidden md:inline ml-2">({totalCustomers} total records)</span>
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isPageLoading}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;