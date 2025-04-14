import React, { useState } from 'react'
import ParticleCanvas from '../../components/UI/ParticleCanvas'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

function SignIn() {
  const [email, setEmail] = useState('')
  const { refreshUser } = useAuth()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('') // State to store the message

  function handleUserChange(event) {
    setEmail(event.target.value)
  }
  function handlePassChange(event) {
    setPassword(event.target.value)
  }

  async function handleSubmit() {
    try {
        const response = await axios.post('http://127.0.0.1:8383/api/auth/signin', {
            email: email,
            password: password
        }, {
            headers: {
                "Content-Type": 'application/json'
            }
        });
        console.log('Response received');
        console.log(response);
        const token = response.data.Authentication;
        console.log(token);
        localStorage.setItem("Authentication", token);
        await refreshUser(); // Call refreshUser
        setMessage(response.data.message); // Set the message from the response
    } catch (error) {
        console.log(error);
        setMessage(error.message || 'An error occurred'); // Display the error message
    }
}

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* ParticleCanvas in background with correct z-index for mouse tracking */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <ParticleCanvas className="w-full h-full" />
      </div>

      <style jsx>{`
        .float-label-container {
          position: relative;
          margin-bottom: 1rem;
        }
        
        .float-label {
          position: absolute;
          left: 0.75rem;
          top: 0.75rem;
          transition: all 0.25s ease;
          pointer-events: none;
          color: #888;
        }
        
        input:focus ~ .float-label,
        input:not(:placeholder-shown) ~ .float-label {
          transform: translateY(-1.2rem);
          font-size: 0.85rem;
          color: #00ADB5;
          font-weight: 600;
          background-color: white;
          padding: 0 0.25rem;
        }
        
        input:focus::placeholder,
        input:not(:placeholder-shown)::placeholder {
          opacity: 0;
        }
      `}</style>

      {/* Sign in container with higher z-index */}
      <div className="relative z-10 border-[2px] border-[#393E46]
                      rounded-lg p-6 flex flex-col space-y-4 bg-white
                      shadow-lg transition-all duration-300
                      ease-in-out hover:shadow-xl w-[18rem]">
        <h1 className="font-medium text-[25px] absolute top-3 left-3 text-gray-800">
          Sign In
        </h1>
        <div className="pt-12 flex flex-col space-y-4">
          {/* Email input with floating label */}
          <div className="float-label-container">
            <input
              type="text"
              placeholder=" "
              value={email}
              onChange={handleUserChange}
              className="border-2 border-gray-300 p-2.5 rounded-md w-full
                        transition-all duration-300 focus:border-[#00ADB5]
                        focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            />
            <span className="float-label">Email</span>
          </div>
          
          {/* Password input with floating label */}
          <div className="float-label-container">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={handlePassChange}
              className="border-2 border-gray-300 p-2.5 rounded-md w-full
                        transition-all duration-300 focus:border-[#00ADB5]
                        focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            />
            <span className="float-label">Password</span>
          </div>
          
          {/* Display message */}
          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}

          {/* Sign In button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-[#00ADB5] py-2.5 px-3 text-white font-medium rounded-md
                      transition-all duration-300 ease-in-out hover:bg-[#009da5]
                      active:scale-95 hover:shadow-md"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignIn
