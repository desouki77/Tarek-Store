// components/TransactionForm.js
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/TransactionForm.css'; // Import your CSS file for styling

const TransactionForm = () => {
    const [type, setType] = useState('input');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState(''); // For feedback messages

    const handleSubmit = async (e) => {
        e.preventDefault();
        const transaction = { type, amount: parseFloat(amount), description };

        // Basic validation
        if (amount <= 0) {
            setMessage('Amount must be a positive number.');
            return;
        }

        try {
            await axios.post('/api/transactions', transaction, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're storing token in localStorage
                },
            });
            setMessage('Transaction added successfully!'); // Success message
            // Clear the form
            setType('input');
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Error adding transaction:', error);
            setMessage('Failed to add transaction. Please try again.'); // Error message
        }
    };

    return (
        <div className="transaction-form-container">
            <h2>Add New Transaction</h2>
            {message && <p className="feedback-message">{message}</p>} {/* Feedback message */}
            <form onSubmit={handleSubmit} className="transaction-form">
                <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                </select>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="form-input"
                />
                <button type="submit" className="form-button">Add Transaction</button>
            </form>
        </div>
    );
};

export default TransactionForm;
