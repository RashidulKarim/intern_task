import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import CreateForm from './pages/CreateForm/CreateForm';
import List from './pages/List/List';
import Update from './pages/Update/Update';

function App() {
  return (
    <div>
      <nav  className="header">
          <h1>Rashidul Karim</h1>
        <ul className="nav">
          <li><Link to='/'>List</Link></li>
          <li><Link to='/inputForm'>Input Form</Link></li>
          <li><Link to='/updateForm'>Update</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<List/>} />
        <Route path="/inputForm" element={<CreateForm />} />
        <Route path="/updateForm" element={<Update />} />
      </Routes>
    </div>
  );
}

export default App;
