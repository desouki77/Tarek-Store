import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" exact element={<Dashboard/>} />
        <Route path="/login" element={<Login/>} />
        <Route path='/transactionForm' element={<TransactionForm/>} />
        <Route path='/transactionList' element={<TransactionList/>} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
