import { useNavigate, } from 'react-router-dom';

export function Home() {
    const navigate = useNavigate();

    return (
      <div style={{ backgroundColor: 'blue'}}>
        <button onClick={() => navigate('/hub')}>Hub</button>
        <button onClick={() => navigate('/search')}>Search</button>
        <button onClick={() => navigate('/counteragents')}>Counteragents</button>
        <button onClick={() => navigate('/users')}>Users</button>
        <button onClick={() => navigate('/currency')}>Currency</button>
      </div>
    );
  }
  