import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Hub } from './pages/hub/Hub';
import { Search } from './pages/search/Search';
import { CounterAgents } from './pages/counteragents/Counteragents';
import { Users } from './pages/users/Users';
import { Currency } from './pages/currency/Currency';
import { Home } from './pages/home/Home';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/hub",
    element: <Hub />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/counteragents",
    element: <CounterAgents />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "/currency",
    element: <Currency />,
  },
]);

function App() {
  return (
    <div>
      <header>
        <RouterProvider router={router}/>
      </header>
    </div>
  );
}

export default App;
