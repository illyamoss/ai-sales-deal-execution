import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProposalView from './pages/ProposalView';
import AnalyticsView from './pages/AnalyticsView';
import ClientProposalView from './pages/ClientProposalView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposal/:id" element={<ProposalView />} />
        <Route path="/analytics/:id" element={<AnalyticsView />} />
        <Route path="/view/:id" element={<ClientProposalView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
