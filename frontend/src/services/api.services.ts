const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Customer {
  id: number;
  name: string;
  age: number;
  email: string;
}

export interface CustomerCreate {
  name: string;
  age: number;
  email: string;
}

export interface CustomerUpdate {
  name?: string;
  age?: number;
  email?: string;
}

export interface PaginatedCustomersResponse {
  records: Customer[];
  total: number;
  skip: number;
  limit: number;
}

// Helper function for making API requests
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.detail || errorData.message || `HTTP error - status: ${response.status}`);
  }
  // For 204 No Content, response.json() will fail so handle it separately
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// ---- CRUD API Functions ---- //

// GET ALL Customers
export const getCustomers = async (skip: number=0, limit: number=10): Promise<PaginatedCustomersResponse> => {
  return request<PaginatedCustomersResponse>(`${API_BASE_URL}/customers/?skip=${skip}&limit=${limit}`);
};

// GET SINGLE Customer
export const getCustomerById = async (id: number): Promise<Customer> => {
  return request<Customer>(`${API_BASE_URL}/customers/${id}`);
};

// CREATE Customer
export const createCustomer = async (customerData: CustomerCreate): Promise<Customer> => {
  return request<Customer>(`${API_BASE_URL}/customers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
};

// UPDATE Customer
export const updateCustomer = async (id: number, customerData: CustomerUpdate): Promise<Customer> => {
  return request<Customer>(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
};

// DELETE Customer
export const deleteCustomer = async (id: number): Promise<Customer> => {
  return request<Customer>(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
  });
};