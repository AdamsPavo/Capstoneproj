import { Routes, Route } from 'react-router-dom';
import Hero from './pages/hero';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Homepage from './pages/hompage';
import CreatePlanPage from './pages/plantingplan';
import FarmingPlan from './pages/createplan';
import Activity from './pages/activity';
import Weather from './pages/weather';
import Analytics from './pages/analytics';
import Setting from './pages/setting';
import PlantingHistory from './pages/plantinghistory';
import Plan from './pages/plan';
import Notification from './pages/notification';
import EditFarmingPlan from './pages/editPlan';
import Progresstracking from '../src/component/progressTracking';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/createplan" element={<CreatePlanPage />} />
      <Route path="/farmingplan" element={<FarmingPlan />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/plantinghistory" element={<PlantingHistory />} />
      <Route path="/plan" element={<Plan />}/>
      <Route path="/notification" element={<Notification />}/>
      <Route path="/editplan/:id" element={<EditFarmingPlan />} />
      <Route path="/progresstracking" element={<Progresstracking />} />
    </Routes>
  );
}

export default App;
