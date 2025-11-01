import React from 'react';
import NLPDashboard from '../components/nlp/NLPDashboard';
import './NLPPage.css';

const NLPPage: React.FC = () => {
  return (
    <div className="nlp-page">
      <NLPDashboard />
    </div>
  );
};

export default NLPPage;