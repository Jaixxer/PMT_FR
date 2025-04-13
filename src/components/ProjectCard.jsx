import React from 'react';
import './styles.css';


function ProjectCard(title,status,description,dueDate,) {
  // Project data (could come from an API or props in a real app)
  const projectData = {
    title: "Project Alpha",
    status: "active",
    description: "A brief description of Project Alpha that outlines its goals and objectives.",
    dueDate: "2025-04-30",
    tasks: {
      pending: 3,
      total: 10
    },
    team: [
      { name: "Alice", avatar: "avatar1.jpg" },
      { name: "Bob", avatar: "avatar2.jpg" },
      { name: "Charlie", avatar: "avatar3.jpg" }
    ],
    recentActivity: {
      task: "Design Logo",
      user: "Bob"
    }
  };

  return (
    <div className="app">
      <div className="project-card">
        <div className="card-header">
          <h3 className="project-title">{projectData.title}</h3>
          <span className={`status-label ${projectData.status}`}>
            {projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1)}
          </span>
        </div>
        <p className="project-description">
          {projectData.description}
        </p>
        <div className="card-details">
          <div className="detail-item">
            <span className="icon">&#x1F4C5;</span>
            <span className="detail-text">Due: {projectData.dueDate}</span>
          </div>
          <div className="detail-item">
            <span className="icon">&#x1F4CB;</span>
            <span className="detail-text">
              {projectData.tasks.pending} tasks pending / {projectData.tasks.total} total
            </span>
          </div>
        </div>
        <div className="team-avatars">
          {projectData.team.map((member, index) => (
            <img 
              key={index} 
              src={member.avatar} 
              alt={member.name} 
              title={member.name} 
              className="avatar" 
            />
          ))}
        </div>
        <div className="recent-activity">
          <small>
            Task "{projectData.recentActivity.task}" updated by {projectData.recentActivity.user}
          </small>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;