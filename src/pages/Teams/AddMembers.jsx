import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { motion } from 'framer-motion';

const AddMembers = () => {
  const [teams, setTeams] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  // Fetch teams and unassigned users on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch team members when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam);
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeam]);

  // Reset success/error messages when selections change
  useEffect(() => {
    setSuccess(null);
    setError(null);
  }, [selectedTeam, selectedUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('Authentication');
      
      // Fetch teams
      const teamsResponse = await axios.get('http://localhost:8383/api/team/teams', {
        headers: { Authentication: token },
      });
      
      // Fetch unassigned users
      const usersResponse = await axios.get('http://localhost:8383/api/team/users-without-team', {
        headers: { Authentication: token },
      });
      
      if (teamsResponse.data && teamsResponse.data.teams) {
        setTeams(teamsResponse.data.teams);
      }
      
      if (usersResponse.data && usersResponse.data.users) {
        setUnassignedUsers(usersResponse.data.users);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    setLoadingMembers(true);
    try {
      const token = localStorage.getItem('Authentication');
      const response = await axios.get(`http://localhost:8383/api/team/members/${teamId}`, {
        headers: { Authentication: token },
      });
      
      if (response.data && response.data.members) {
        setTeamMembers(response.data.members);
      } else {
        setTeamMembers([]);
      }
      setLoadingMembers(false);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setLoadingMembers(false);
      setTeamMembers([]);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam || !selectedUser) {
      setError('Please select both a team and a user');
      return;
    }
    
    try {
      const token = localStorage.getItem('Authentication');
      const response = await axios.post(
        'http://localhost:8383/api/team/members/add',
        {
          user_id: selectedUser,
          team_id: selectedTeam
        },
        {
          headers: { Authentication: token },
        }
      );
      
      setSuccess('User successfully added to the team');
      
      // Refresh data
      fetchData();
      fetchTeamMembers(selectedTeam);
      setSelectedUser('');
    } catch (err) {
      console.error('Error adding member to team:', err);
      setError(err.response?.data?.error || 'Failed to add member to team');
    }
  };

  const confirmRemoveMember = (user) => {
    setUserToRemove(user);
    setShowConfirmation(true);
  };
  
  const cancelRemove = () => {
    setUserToRemove(null);
    setShowConfirmation(false);
  };

  const handleRemoveMember = async () => {
    if (!userToRemove) return;
    
    try {
      const token = localStorage.getItem('Authentication');
      const response = await axios.post(
        'http://localhost:8383/api/team/members/remove',
        {
          user_id: userToRemove.uid
        },
        {
          headers: { Authentication: token },
        }
      );
      
      setSuccess(`${userToRemove.username} successfully removed from the team`);
      setShowConfirmation(false);
      setUserToRemove(null);
      
      // Refresh data
      fetchData();
      fetchTeamMembers(selectedTeam);
    } catch (err) {
      console.error('Error removing member from team:', err);
      setError(err.response?.data?.error || 'Failed to remove member from team');
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE]/30">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div 
          className="flex-1 p-6 mt-16 transition-all duration-300 ease-in-out"
          style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
        >
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#222831]">Team Member Management</h1>
            <p className="text-[#393E46]">Add or remove members from teams</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-[#00ADB5]">Loading data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add Members Form */}
              <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-[#222831]">Add Team Member</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleAddMember}>
                  <div className="mb-4">
                    <label htmlFor="team" className="block text-sm font-medium text-[#222831] mb-1">
                      Select Team
                    </label>
                    <select
                      id="team"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                      required
                    >
                      <option value="">Select a team</option>
                      {teams.map((team) => (
                        <option key={team.team_id} value={team.team_id}>
                          {team.team_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="user" className="block text-sm font-medium text-[#222831] mb-1">
                      Select User
                    </label>
                    <select
                      id="user"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                      required
                      disabled={unassignedUsers.length === 0}
                    >
                      <option value="">Select a user</option>
                      {unassignedUsers.map((user) => (
                        <option key={user.uid} value={user.uid}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                    {unassignedUsers.length === 0 && (
                      <p className="text-xs text-amber-500 mt-1">
                        No unassigned users available
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-[#00ADB5] text-white py-2 px-4 rounded-md hover:bg-[#00ADB5]/90 focus:outline-none transition-all"
                    disabled={!selectedTeam || !selectedUser}
                  >
                    Add to Team
                  </button>
                </form>
              </div>
              
              {/* Team Members List */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-[#222831]">
                  {selectedTeam 
                    ? `Team Members: ${teams.find(t => t.team_id.toString() === selectedTeam.toString())?.team_name || 'Selected Team'}` 
                    : 'Select a team to view members'}
                </h2>
                
                {!selectedTeam ? (
                  <div className="flex justify-center items-center h-64 text-[#393E46]">
                    Select a team to view its members
                  </div>
                ) : loadingMembers ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-[#00ADB5]">Loading team members...</div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="flex justify-center items-center h-64 text-[#393E46]">
                    No members in this team
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <li key={member.uid} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#393E46] text-white flex items-center justify-center text-base mr-3">
                            {member.username.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#222831]">{member.username}</p>
                            <p className="text-xs text-[#393E46]">{member.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => confirmRemoveMember(member)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Removal</h3>
            <p className="mb-4">
              Are you sure you want to remove <span className="font-semibold">{userToRemove?.username}</span> from this team?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 border border-gray-300 rounded-md text-[#393E46] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMembers;