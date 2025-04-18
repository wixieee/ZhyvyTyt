document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.getElementById("loginBtn");
    const modal = document.getElementById("loginModal");
    const closeBtn = document.querySelector(".login-close");
    const loginForm = document.getElementById("loginForm");
    const userEmail = document.querySelector(".user__email");

    function checkAuth() {
        const savedEmail = localStorage.getItem("userEmail");
        if (savedEmail) {
            loginBtn.textContent = "Вийти";
            loginBtn.removeEventListener("click", openModal);
            loginBtn.addEventListener("click", logout);
        } else {
            loginBtn.textContent = "Увійти";
            loginBtn.removeEventListener("click", logout);
            loginBtn.addEventListener("click", openModal);
        }
        updateEmail();
    }

    function openModal(event) {
        event.preventDefault();
        modal.style.display = "block";
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            modal.style.display = "none";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            localStorage.setItem("userEmail", email);
            modal.style.display = "none";
            checkAuth();
        });
    }

    function updateEmail() {
        const savedEmail = localStorage.getItem("userEmail");
        if (userEmail) {
            userEmail.textContent = savedEmail ? savedEmail : "Не авторизовано";
        }
    }

    function logout(event) {
        event.preventDefault();
        localStorage.removeItem("userEmail");
        checkAuth();
    }

    checkAuth();
});
