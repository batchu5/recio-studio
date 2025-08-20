import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import SelfRecording from "./pages/SelfRecording"; 
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Studio from "./components/Studio";

export default function App() {
    return (
        <Router>

          <Routes>
            <Route path="/self" element={<SelfRecording />}/>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />

            <Route
             path="/dashboard" 
             element={
              <ProtectedRoute>
                  <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/studio/:token" element={<Studio />}></Route>

          </Routes>

        </Router>
      
    )
}
