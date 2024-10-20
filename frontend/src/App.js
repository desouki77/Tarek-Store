import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" exact element={<Dashboard/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
