// components/TransactionForm.js
import React, { useState } from 'react';
import axios from 'axios';

const TransactionForm = () => {
    const [type, setType] = useState('input');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const transaction = { type, amount: parseFloat(amount), description };

        try {
            await axios.post('/api/transactions', transaction, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're storing token in localStorage
                },
            });
            // Clear form or show success message
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="input">Input</option>
                <option value="output">Output</option>
            </select>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                required
            />
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <button type="submit">Add Transaction</button>
        </form>
    );
};

export default TransactionForm;
