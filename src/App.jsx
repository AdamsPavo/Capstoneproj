import { Routes, Route } from 'react-router-dom';
import Hero from './pages/hero';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Homepage from './pages/hompage';
import CreatePlanPage from './pages/plantingplan';
import FarmingPlan from './pages/createplan';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/createplan" element={<CreatePlanPage />} />
      <Route path="/farmingplan" element={<FarmingPlan />} />

    </Routes>
  );
}

export default App;
