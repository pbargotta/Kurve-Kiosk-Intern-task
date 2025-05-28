import { useState, useEffect } from 'react';
import { getCustomers, type Customer } from './services/api.services';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect to fetch customers when the component mounts
  useEffect(() => {
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

    fetchCustomers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl">Error loading customers:</p>
        <p>{error}</p>
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

      {/* Placeholder for Add Customer button/form */}
      <div className="mb-6 text-center">
        <button
          className="px-4 py-2 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={() => alert('Add Customer functionality to be implemented')}
        >
          Add New Customer
        </button>
      </div>

      {/* Displaying the list of customers */}
      {customers.length === 0 ? (
        <p className="text-center text-gray-600">No customers found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Age
                </th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {customer.id}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {customer.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {customer.age}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {customer.email}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 whitespace-no-wrap">
                    {/* Placeholder for Edit/Delete buttons */}
                    <button className="mr-2 text-indigo-600 hover:text-indigo-900" onClick={() => alert(`Edit ${customer.name}`)}>
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => alert(`Delete ${customer.name}`)}>
                      Delete
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