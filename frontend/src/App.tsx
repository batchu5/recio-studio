import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import SelfRecording from "./pages/SelfRecording"; 
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PreStudio from "./pages/PreStudio";
import JoinAsGuest from "./pages/JoinAsGuest";

export default function App() {
    return (
        <Router>

          <Routes>
            <Route path="/self" element={<SelfRecording />}/>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            
            <Route path="/preStudio" element={<PreStudio/>} />

            <Route
             path="/dashboard" 
             element={
              <ProtectedRoute>
                  <Dashboard />
              </ProtectedRoute>
            } />

            <Route path = "/join/:roomName" element={
              <ProtectedRoute>
                  <JoinAsGuest />
              </ProtectedRoute>
            } />


          </Routes>

        </Router>
      
    )
}
