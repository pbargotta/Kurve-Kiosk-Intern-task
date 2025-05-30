# Kurve Kiosk - Full Stack Intern Task

This project is a simple full-stack application for managing a list of customers, supporting basic CRUD (Create, Read, Update, Delete) operations. The data persists in a MySQL database.

## Tech Stack

*   **Backend:** Python, FastAPI, SQLAlchemy (ORM), Uvicorn (ASGI Server)
*   **Database:** MySQL
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js and npm:** For running the frontend.
2.  **Python:** For running the backend.
3.  **MySQL Server:** The database for storing customer data.

## Project Setup

1.  **Clone the Repository:**
    ```bash
    git clone <https://github.com/pbargotta/Kurve-Kiosk-Intern-task>
    cd kurve-kiosk-intern-task
    ```

2.  **Backend Setup:**

    *   **Navigate to the backend directory:**
        ```bash
        cd backend
        ```
    *   **Create and activate a Python virtual environment:**
        ```bash
        # For Linux/macOS
        python3 -m venv venv
        source venv/bin/activate

        # For Windows (PowerShell)
        python -m venv venv
        .\venv\Scripts\Activate.ps1 
        ```
    *   **Install Python dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
    *   **MySQL Database Configuration:**
        1.  Ensure your MySQL server is running.
        2.  Connect to your MySQL server (e.g., using `mysql -u root -p` or a GUI tool like MySQL Workbench).
        3.  Create a database for the application:
            ```sql
            CREATE DATABASE kurve_kiosk_db;
            ```
        4.  Create a dedicated MySQL user and grant privileges (replace `'your_password'` with a password):
            ```sql
            CREATE USER 'kurve_user'@'localhost' IDENTIFIED BY 'your_password';
            GRANT ALL PRIVILEGES ON kurve_kiosk_db.* TO 'kurve_user'@'localhost';
            FLUSH PRIVILEGES;
            ```
        5.  If your MySQL user, password, host, port, or database name are different from the above, you will need to update them in the backend's environment file.
    *   **Configure Backend Environment Variables:**
        1.  In the `backend` directory, create a file named `.env` and add your database URL configured your MySQL connection details:
            ```env
            # .env
            DATABASE_URL="mysql+aiomysql://kurve_user:your_strong_password@localhost:3306/kurve_kiosk_db"
            ```
            Replace `kurve_user`, `your_password`, `localhost`, `3306`, and `kurve_kiosk_db` if you used different values.

3.  **Frontend Setup:**

    *   **Navigate to the frontend directory (from the project root):**
    *   **Install Node.js dependencies:**
        ```bash
        npm install
        ```
    *   **Configure Frontend Environment Variables (Optional - Defaults should work):**
        The frontend expects the backend API to be running on `http://127.0.0.1:8000/api`. This is configured in `frontend/.env.development`. If your backend runs on a different port, update this file.
        ```env
        # frontend/.env.development
        VITE_API_BASE_URL=http://127.0.0.1:8000/api
        ```

## Running the Application

You need to run both the backend and frontend servers simultaneously in separate terminal windows.

1.  **Start the Backend Server:**
    *   Open a terminal, navigate to the `backend` directory, and ensure your Python virtual environment is activated, then `cd ..` back to the `root` directory.
    *   Run Uvicorn:
        ```bash
        uvicorn backend.main:app --reload
        ```
    *   The backend API will be available at `http://127.0.0.1:8000`.
    *   Interactive API documentation (Swagger UI) will be at `http://127.0.0.1:8000/docs`.
    *   The application will automatically create the necessary `customers` table in your database if it doesn't already exist when the backend starts.

2.  **Start the Frontend Development Server:**
    *   Open another terminal, navigate to the `frontend` directory.
    *   Run the Vite development server:
        ```bash
        npm run dev
        ```
    *   The frontend application will typically be available at `http://localhost:5173` (Vite will indicate the exact URL in the console). Open this URL in your web browser.

## Using the Application

*   The main interface displays a list of customers with pagination.
*   **Add New Customer:** Click the "Add New Customer" button and fill out the form.
*   **Edit Customer:** Click the "Edit" button next to a customer.
*   **Delete Customer:** Click the "Delete" button next to a customer. A confirmation component will appear.
*   **Pagination:** Use the "Previous," "Next," and page number buttons to navigate through the customer list.

## Developer Utilities

A "Developer Utilities" section will appear at the bottom of the page. This section allows you to:

*   **Add X Records:** Adds a specified number of randomly generated customer records to the database. This will add *new* unique records.
*   **Clear Database:** Removes ALL customer data from the `customers` table. Use with caution.

These utilities are helpful for quickly populating the database for testing and demonstration, especially for assessing performance with a large number of records

## Stopping the Application

*   To stop the backend server, press `CTRL+C` in its terminal window.
*   To stop the frontend development server, press `CTRL+C` in its terminal window.
