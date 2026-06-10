const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : 'https://decode-labs-internship-sandy.vercel.app/api';

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const profileMenu = document.querySelector('.profile-menu');
    const closeBtn = document.querySelector('.close');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const completeRegBtn = document.getElementById('complete-reg-btn');

    const authStep1 = document.getElementById('auth-step-1');
    const authStep2 = document.getElementById('auth-step-2');
    const authStep3 = document.getElementById('auth-step-3');

    let currentIdentifier = '';
    let loginMethod = 'email';

    // Show Modal
    profileMenu.addEventListener('click', () => {
        if (!localStorage.getItem('token')) {
            authModal.style.display = 'block';
        } else {
            window.location.href = 'profile.html';
        }
    });

    // Close Modal
    closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
        resetSteps();
    });

    window.onclick = (event) => {
        if (event.target == authModal) {
            authModal.style.display = 'none';
            resetSteps();
        }
    }

    function resetSteps() {
        authStep1.style.display = 'block';
        authStep2.style.display = 'none';
        authStep3.style.display = 'none';
    }

    // Step 1: Send OTP
    sendOtpBtn.addEventListener('click', async () => {
        loginMethod = document.getElementById('login-method').value;
        currentIdentifier = document.getElementById('auth-identifier').value;

        if (!currentIdentifier) return alert('Please enter email or phone');

        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [loginMethod]: currentIdentifier })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('display-identifier').innerText = currentIdentifier;
                authStep1.style.display = 'none';
                authStep2.style.display = 'block';
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Step 2: Verify OTP
    verifyOtpBtn.addEventListener('click', async () => {
        const otp = document.getElementById('otp-input').value;
        if (!otp) return alert('Please enter OTP');

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    [loginMethod]: currentIdentifier,
                    otp 
                })
            });
            const data = await res.json();
            if (data.success) {
                if (data.isNewUser) {
                    authStep2.style.display = 'none';
                    authStep3.style.display = 'block';
                } else {
                    handleLoginSuccess(data);
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Step 3: Complete Registration
    completeRegBtn.addEventListener('click', async () => {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const gender = document.getElementById('gender').value;
        const otp = document.getElementById('otp-input').value;

        if (!firstName || !lastName) return alert('Please fill all fields');

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    [loginMethod]: currentIdentifier,
                    otp,
                    firstName,
                    lastName,
                    gender
                })
            });
            const data = await res.json();
            if (data.success) {
                handleLoginSuccess(data);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    function handleLoginSuccess(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authModal.style.display = 'none';
        updateUI();
        location.reload(); // Refresh to update all components
    }

    function updateUI() {
        const user = JSON.parse(localStorage.getItem('user'));
        const sellerBtn = document.querySelector('.btn-text');
        
        if (user) {
            document.querySelector('.profile-text').innerText = user.firstName;
            if (user.isSeller) {
                sellerBtn.innerText = 'My Products';
            }
            sellerBtn.addEventListener('click', () => {
                window.location.href = 'seller.html';
            });
        } else {
            sellerBtn.addEventListener('click', () => {
                authModal.style.display = 'block';
            });
        }
    }

    updateUI();
});
