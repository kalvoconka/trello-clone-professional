import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to boards page
    navigate('/boards', { replace: true });
  }, [navigate]);

  return null;
};