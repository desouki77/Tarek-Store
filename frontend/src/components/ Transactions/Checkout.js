import React, { useEffect, useState } from 'react';
import '../../styles/Checkout.css'; // Ensure you import the CSS file
import axios from 'axios';
import Loader from '../Loader';



const Checkout = () => {
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [discount, setDiscount] = useState(''); // Default to an empty string
    const [paid, setPaid] = useState(''); // Default to an empty string
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());


    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
        date: new Date().toLocaleDateString(),
    });

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        
        const items = sessionStorage.getItem('checkoutItems');
        if (items) {
            setCheckoutItems(JSON.parse(items));
        }

        // Set up a timer to update the current time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        const userId = localStorage.getItem("userId");
        const branchId = localStorage.getItem("branchId");

        const fetchUserData = async () => {
            try {
                // Fetch user data
                const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
                const branchResponse = await axios.get(`http://localhost:5000/api/branches/${branchId}`);

                setWelcomeData(prevData => ({
                    ...prevData,
                    salesName: userResponse.data.username,
                    branchName: branchResponse.data.name
                }));
            } catch (error) {
                console.error("Error fetching user or branch data:", error);
            } 
            finally {
                setLoading(false);
            }
        };

        fetchUserData();
        // Clean up the interval on component unmount
        return () => clearInterval(timer);
    }, []);

    const totalAmount = checkoutItems.reduce((total, item) => total + item.price, 0);
    const totalAfterDiscount = totalAmount - Number(discount); // Calculate total after discount
    const remaining = Number(paid) - totalAfterDiscount; // Calculate remaining amount to be paid
     

    const handleSubmit = async () => {
        // Retrieve the branchId from local storage
        const branchId = localStorage.getItem('branchId');
    
        // Check if branchId exists, if not, show an alert and return
        if (!branchId) {
            alert('Branch ID is missing.');
            return;
        }


    
        const orderData = {
            branchId: branchId,  // Make sure the property name matches your backend's expected key (branchIs)
            checkoutItems,
            discount: Number(discount) || 0,
            paid: Number(paid) || 0,
            remaining: (Number(paid) || 0) - totalAfterDiscount,
            clientName,
            clientPhone,
            date: new Date().toLocaleDateString(),
            time: currentTime,
        };  

        if (!paid) {
            alert("برجاء ادخال مبلغ الدفع!!");
            return;
        }
        if (remaining !== 0 && (!clientName || !clientPhone)) {
            alert("هناك باقي!! برجائ اخذ اسم ورقم العميل");
            return;
        }
    
        try {
            // Create the order and decrease product quantities in one go
            const response = await axios.post('http://localhost:5000/api/orders', orderData , {

                headers: {
                    'Content-Type': 'application/json',
                }
            });

            
    
                    // Assuming `branchId` is available in your component or context
                const branchId = localStorage.getItem('branchId');

            // If order creation is successful, update quantities
            for (const item of checkoutItems) {
                try {
                    const response = await axios.put(`http://localhost:5000/api/products/${item.barcode}/decrease`, {
                        quantity: 1, // Specify quantity to decrease
                        branchId: branchId, // Ensure branchId is included in the request body
                    });
                    console.log('Quantity updated successfully:', response.data);
                } catch (error) {
                    console.error('Error decreasing quantity:', error.response?.data || error.message);
                }
            }
    
            console.log(response.data.message);
    
            // Clear session storage and reset state
            sessionStorage.removeItem('checkoutItems');
            setCheckoutItems([]);
            setDiscount('');
            setPaid('');
            setClientName('');
            setClientPhone('');
    
            window.close(); // Close the window after submitting
    
        } catch (error) {
            console.error('Error:', error.response ? error.response.data.message : error.message);
        }


    };
    

    const handlePrint = () => {
        window.print(); // Open the print dialog
    };

    if (loading) {
        return <Loader />; // You can customize this loading message or add a spinner
    }

    return (
        <div id='checkout-container'>
            <h1>اتمام البيع</h1>
            <div id="printable-section">
                {/* Print-only information at the top */}
                <div className="print-only">
                <p>{welcomeData.storeName}</p>
                  <p>{welcomeData.branchName}</p>
                  <p>{welcomeData.salesName}</p>
                  <p>Date: {welcomeData.date}</p>
                  <p>Time: {currentTime}</p>
                </div>

                {/* Items that will be printed */}
                <table>
                    <thead>
                        <tr>
                            <th>الباركود</th>
                            <th>اسم المنتج</th>
                            <th>السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checkoutItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.barcode}</td>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total and financial details, without client information */}
                <div className="print-only">
                    <p>إجمالي المبلغ: {totalAmount}</p>
                    <p>الخصم: {discount}</p>
                    <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p> {/* Added total after discount */}
                    <p>المبلغ المدفوع: {paid}</p>
                    <p>المتبقي: {remaining}</p>
                </div>
            </div>

            {/* Hidden Inputs and Buttons for print view */}
            <div className="input-section">
                <p>إجمالي المبلغ: {totalAmount}</p>

                <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="الخصم"
                />
                <input
                    type="number"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    placeholder="المبلغ المدفوع"
                />
                <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p>
                <p>المتبقي: {remaining}</p>
                <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="اسم العميل"
                />
                <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="رقم هاتف العميل"
                />
                <button onClick={handlePrint}>طباعة الإيصال</button>
                <button onClick={handleSubmit}>تقديم الطلب</button>
            </div>
        </div>
    );
};

export default Checkout;
