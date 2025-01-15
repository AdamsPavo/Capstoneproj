import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'




function hero(){

    return(
        <>
         <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-white">
        <div className="flex items-center justify-center md:w-1/2 mb-6 md:mb-0">
        <img
          src={logo}
          alt="P-Tubigan Logo"
          className="w-100 h-100 md:w-200 md:h-200 sm:w-30sm:h-30"
        />
      </div>
      <div className="text-center md:text-left md:w-1/2">
      <h1 className="text-2xl md:text-7xl sm:text-6xl font-bold text-black mb-4">
          Let’s revolutionize rice farming together
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Stay smart, save water, and grow better.
        </p>
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-4 md:justify-start">
          <Link to="/signin">
          <button className="px-4 py-2 w-40 h-10 text-md font-semibold border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-200 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
              Sign In
            </button>
          </Link>
            <Link to="/signup">
            <button className="px-4 py-2 w-40 h-10 text-md font-semibold bg-blue-500 text-white rounded-2xl hover:bg-blue-600 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
              Sign Up
            </button>
            </Link>
            
        </div>
      </div>
    </div>
        </>
    )
}

export default hero;