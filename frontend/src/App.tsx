import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import SelfRecording from "./pages/SelfRecording"; 
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PreStudio from "./pages/PreStudio";
import JoinAsGuest from "./pages/JoinAsGuest";
import UniqueRoom from "./pages/UniqueRoom";
import { ToastContainer } from "react-toastify";
import LandingPage from "./pages/LandingPage";
import { RoomProvider } from "./components/RoomContext";

export default function App() {


    return (
        <Router>
          
          <Routes>
            <Route path="/" element={<LandingPage />}/>
            <Route path="/self" element={<SelfRecording />}/>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            
            <Route path="/preStudio" element={<PreStudio/>} />

            <Route
             path="/dashboard" 
             element={
              <ProtectedRoute>
                <RoomProvider>
                  <Dashboard />
                </RoomProvider>
              </ProtectedRoute>
            } />

            <Route path = "/join/:roomId" element={
              <ProtectedRoute >
                  <JoinAsGuest />
              </ProtectedRoute>
            } />

            <Route path="/preStudio/:roomId" element={<UniqueRoom />} />


          </Routes>
          <ToastContainer />

        </Router>
      
    )
}
