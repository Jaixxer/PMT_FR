import React from 'react'
import { Routes, Route } from 'react-router'
import SignIn from './pages/Auth/SignIn.jsx'
import SignUp from './pages/Auth/SignUp.jsx' 
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import './index.css' // Make sure this imports your global CSS
import TaskPage from './pages/Tasks/TaskPage.jsx';
import TaskCreation from './pages/Tasks/TaskCreation.jsx';
import Board from './pages/Board/BoardComponent.jsx';
import AddMembers from './pages/Teams/AddMembers.jsx';
import TicketsPage from './pages/Tickets/TicketsPage.jsx';
import CreateTicket from './pages/Tickets/CreateTicket.jsx';

function App() {
  return (
    <div className="min-h-screen m-0 p-0">
      {/* Add the style tag if needed */}
      
      
      <Routes>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/tasks' element={<TaskPage/>}/>
        <Route path='/board' element={<Board/>}/>
        <Route path='/team/members' element={<AddMembers/>}/>
        {/* Ticket Routes */}
        <Route path='/tickets' element={<TicketsPage/>}/>
        <Route path='/tickets/create' element={<CreateTicket/>}/>
      </Routes>
    </div>
  )
}

export default App