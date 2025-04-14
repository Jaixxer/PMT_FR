import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { motion } from 'framer-motion';

const Board = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('Authentication');
        const response = await axios.get('http://localhost:8383/api/team/teams', {
          headers: { Authentication: token },
        });
        
        if (response.data && response.data.teams) {
          setTeams(response.data.teams);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Placeholder function for progress calculation
  const calculateProgress = (teamId) => {
    // TODO: Implement actual progress calculation logic later
    // For now, return a random value between 0-100
    return Math.floor(Math.random() * 101);
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
          {/* Board Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#222831]">Team Board</h1>
            <p className="text-[#393E46]">View all teams and their progress</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-[#00ADB5]">Loading teams...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <TeamCard 
                  key={team.team_id} 
                  team={team} 
                  progress={calculateProgress(team.team_id)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TeamCard = ({ team, progress }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch team members when card is expanded
    if (expanded) {
      fetchTeamMembers();
    }
  }, [expanded, team.team_id]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Authentication');
      const response = await axios.get(`http://localhost:8383/api/team/members/${team.team_id}`, {
        headers: { Authentication: token },
      });
      
      if (response.data && response.data.members) {
        setTeamMembers(response.data.members.map(member => ({
          id: member.uid,
          name: member.username || 'Unknown',
          email: member.email || '',
          role: 'Team Member', // We can enhance this later if needed
          profilePicture: member.profile_picture
        })));
      } else {
        setTeamMembers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
      layout
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-[#222831]">{team.team_name}</h3>
          <div className="bg-[#00ADB5]/10 text-[#00ADB5] text-sm font-medium px-3 py-1 rounded-full">
            {progress}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-[#00ADB5] h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Team Description (Placeholder) */}
        <p className="text-[#393E46] text-sm mb-4">
          {team.description || "No description available for this team."}
        </p>

        <div className="flex justify-between items-center">
          {/* Team Avatar Stack */}
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map(member => (
              <div 
                key={member.id}
                className="w-8 h-8 rounded-full bg-[#393E46] text-white flex items-center justify-center text-xs border-2 border-white"
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {teamMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-[#393E46] flex items-center justify-center text-xs border-2 border-white">
                +{teamMembers.length - 3}
              </div>
            )}
            {teamMembers.length === 0 && !loading && !expanded && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-[#393E46] flex items-center justify-center text-xs border-2 border-white">
                0
              </div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <button
            className="text-[#00ADB5] text-sm hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Members' : 'Show Members'}
          </button>
        </div>

        {/* Expanded Team Members Section */}
        <motion.div
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{ 
            height: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 16 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-[#222831] mb-2">Team Members</h4>
            
            {loading ? (
              <div className="text-center py-4">
                <span className="text-sm text-[#00ADB5]">Loading members...</span>
              </div>
            ) : error ? (
              <div className="text-center py-2">
                <span className="text-xs text-red-500">{error}</span>
              </div>
            ) : teamMembers.length > 0 ? (
              <ul className="space-y-2">
                {teamMembers.map(member => (
                  <li key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#393E46] text-white flex items-center justify-center text-xs mr-2">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm text-[#222831]">{member.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{member.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-2">
                <span className="text-xs text-gray-500">No members found in this team.</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Board;