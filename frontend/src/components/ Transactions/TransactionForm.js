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
    <></>
    );
};

export default TransactionForm;
