
import React, { useState, useEffect } from "react";
import EmployeeForm from "./Components/EmployeeForm";
import EmployeeList from "./Components/EmployeeList";
import EmployeeItem from "./Components/EmployeeItem";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const initialForm = {
  name: "",
  email: "",
  department: "",
  salary: "",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Read: Fetch employees from API
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch employees.");
        }

        const data = await response.json();

        const formattedEmployees = data.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          department: item.company.name,
          salary: 30000 + item.id * 1000,
        }));

        setEmployees(formattedEmployees);
      } catch (err) {
        setError("Could not load employees. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const employeeData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      department: formData.department.trim(),
      salary: Number(formData.salary),
    };

    try {
      if (editingId !== null) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
          throw new Error("Update failed.");
        }

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingId
              ? { ...employeeData, id: editingId }
              : emp
          )
        );

        setMessage("Employee updated successfully!");
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
          throw new Error("Create failed.");
        }

        const result = await response.json();

        setEmployees((prev) => [
          ...prev,
          { ...employeeData, id: result.id ?? Date.now() },
        ]);

        setMessage("Employee added successfully!");
      }

      setFormData(initialForm);
      setEditingId(null);
    } catch (err) {
      setError("API request failed. Please try again.");
    }
  };

  // Select employee for editing
  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      salary: String(employee.salary),
    });

    setEditingId(employee.id);
    setMessage("");
    setError("");
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));

      if (editingId === id) {
        setEditingId(null);
        setFormData(initialForm);
      }

      setMessage("Employee deleted successfully!");
    } catch (err) {
      setError("Could not delete employee. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialForm);
    setMessage("");
    setError("");
  };

  return (
    <div className="app">
      <h1>Employee Management System</h1>
      <p className="subtitle">Complete CRUD Application</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <EmployeeForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isEditing={editingId !== null}
        onCancel={handleCancel}
      />

      {loading ? (
        <p className="status">Loading employees...</p>
      ) : (
        <EmployeeList
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default App;
