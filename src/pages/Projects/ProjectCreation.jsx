import React, { useEffect, useState } from 'react';
import axios from 'axios'


function ProjectCreation({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamManagers, setTeamManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("Authentication");
      const response = await axios.get("http://localhost:8383/api/info/all", {
        headers: { Authentication: token }
      })
      console.log(response.data)
      setUsers(response.data)
    }
    fetchUsers();
  }, [])




  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(dueDate)
    // Simple validation
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    async function createPj() {
      console.log(dueDate)
      const response = await axios.post("http://localhost:8383/api/project/createpj", {
        title,
        description,
        dueDate,
        teamMembers,
        teamManagers
      }, {
        headers: { Authentication: localStorage.getItem("Authentication") }
      })
      console.log(response)
    }

    const projectData = {
      title,
      description,
      dueDate,
      teamMembers,
      teamManagers
    };

    console.log(projectData)
    onSubmit(createPj(projectData));
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setTeamMembers([]);
    setError("");
    setTeamManagers([]);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#EEEEEE] rounded-lg p-5 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-[#222831]">Create New Project</h2>
          <button
            onClick={handleClose}
            className="text-[#393E46] hover:text-[#222831] text-lg"
          >
            ×
          </button>
        </div>

        {error && <p className="text-red-500 mb-3 text-xs">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Project Title */}
          <div className="mb-3">
            <label htmlFor="title" className="block text-xs font-medium text-[#222831] mb-1">
              Project Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value) }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
              placeholder="Enter project title"
            />
          </div>

          {/* Project Description */}
          <div className="mb-3">
            <label htmlFor="description" className="block text-xs font-medium text-[#222831] mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
              placeholder="Describe your project"
            ></textarea>
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label htmlFor="dueDate" className="block text-xs font-medium text-[#222831] mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            />
          </div>

          {/* Team Managers section */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#222831] mb-1">
              Team Managers
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Select Team Managers from the list.
            </p>
            <div className="h-32 w-full overflow-y-auto border-2 border-[#222831] p-1.5 rounded-md">
              {users && users.map(user => {
                return (
                  <div key={`Manager-${user.uid}`} className="mb-1.5">
                    <label htmlFor={`Manager-${user.uid}`} className="block w-full cursor-pointer">
                      {/* Hidden checkbox */}
                      <input 
                        type='checkbox' 
                        id={`Manager-${user.uid}`}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeamManagers([...teamManagers, user.uid]);
                          } else {
                            setTeamManagers(teamManagers.filter(id => id !== user.uid));
                          }
                        }}
                        className="sr-only"
                      />
                      
                      {/* Custom styled selection element */}
                      <div className={`
                        flex items-center justify-center
                        p-2 rounded-md transition-all duration-200
                        ${teamManagers.includes(user.uid) 
                          ? 'border-2 border-[#00ADB5] bg-[#EEEEEE]' 
                          : 'border border-[#393E46] hover:border-[#00ADB5] hover:bg-gray-50'}
                      `}>
                        <span className="text-[#222831] font-semibold text-xs tracking-wide">{user.email}</span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Members section - separate div */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#222831] mb-1">
              Team Members
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Select Team Members from the list.
            </p>
            <div className="h-32 w-full overflow-y-auto border-2 border-[#222831] p-1.5 rounded-md">
              {users && users.map(user => {
                return (
                  <div key={`Member-${user.uid}`} className="mb-1.5">
                    <label htmlFor={`Member-${user.uid}`} className="block w-full cursor-pointer">
                      {/* Hidden checkbox */}
                      <input 
                        type='checkbox' 
                        id={`Member-${user.uid}`}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeamMembers([...teamMembers, user.uid]);
                          } else {
                            setTeamMembers(teamMembers.filter(id => id !== user.uid));
                          }
                        }}
                        className="sr-only"
                      />
                      
                      {/* Custom styled selection element */}
                      <div className={`
                        flex items-center justify-center
                        p-2 rounded-md transition-all duration-200
                        ${teamMembers.includes(user.uid) 
                          ? 'border-2 border-[#00ADB5] bg-[#EEEEEE]' 
                          : 'border border-[#393E46] hover:border-[#00ADB5] hover:bg-gray-50'}
                      `}>
                        <span className="text-[#222831] font-semibold text-xs tracking-wide">{user.email}</span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-[#393E46] text-[#393E46] text-sm rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#00ADB5] text-white text-sm rounded-md hover:bg-[#00ADB5]/90 focus:outline-none"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectCreation;
