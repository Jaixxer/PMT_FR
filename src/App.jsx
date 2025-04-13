import React from 'react'
import { Routes, Route } from 'react-router'
import SignIn from './SignIn&SignUp/SignIn.jsx'
import SignUp from './SignIn&SignUp/SignUp.jsx' 
import Dashboard from './ProjectDashboard/Dashboard.jsx'
import './index.css' // Make sure this imports your global CSS
import TaskPage from './Tasks/taskPage.jsx'

// Add this style tag or add these rules to your index.css
const globalStyles = `
  body, html {
    margin: 0;
    padding: 0;
  }
`;

function App() {
  return (
    <div className="min-h-screen m-0 p-0">
      {/* Add the style tag if needed */}
      <style>{globalStyles}</style>
      
      <Routes>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/tasks' element={<TaskPage/>}/>
      </Routes>
    </div>
  )
}

export default App