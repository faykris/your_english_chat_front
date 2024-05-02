import React, {useState} from 'react';
import Home from './Home/Home';
import Login from './Login/Login';
import './App.css';

const App: React.FC = () =>{
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (accessToken: string) => {
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="App">
      {token ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
