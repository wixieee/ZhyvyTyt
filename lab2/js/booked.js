document.addEventListener("DOMContentLoaded", function () {
    const bookedContainer = document.querySelector(".booked__apartments");

    if (bookedContainer) {
        function renderBookings() {
            let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

            bookedContainer.innerHTML = bookings.map(flat => `
                <div class="booked__card">
                    <a href="${flat.link}" class="booked__link">
                        <img src="${flat.img}" class="booked__img">
                        <div class="booked__data">
                            <h2 class="booked__location"><i class='bx bx-map'></i>${flat.address}</h2>
                            <h2 class="booked__date"><i class='bx bx-calendar'></i>${flat.dates}</h2>
                    </a>
                            <button class="button cancel__button" data-address="${flat.address}" data-dates="${flat.dates}">Відмінити</button>
                        </div>
                </div>
            `).join("");

            document.querySelectorAll(".cancel__button").forEach(button => {
                button.addEventListener("click", function () {
                    let address = this.dataset.address;
                    let dates = this.dataset.dates;

                    let updatedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
                    updatedBookings = updatedBookings.filter(b => !(b.address === address && b.dates === dates));

                    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
                    renderBookings();
                });
            });
        }

        renderBookings();
    }
});




