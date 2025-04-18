fetch("json/apartments.json")
    .then(response => response.json())
    .then(flats => {
        const container = document.getElementById('foundContainer');
        container.innerHTML = "";

        let i = 0;
        do {
            const flat = flats[i];

            container.innerHTML += `
                <div class="found__card">
                    <a href="flat.html?id=${flat.id}" class="found__link">
                        <img src="${flat.images[0]}" class="found__img">
                        <div class="found__data">
                            <h2 class="found__title"><i class='bx bx-map'></i>${flat.location}</h2>
                            <h2 class="found__rooms"><i class='bx bx-building'></i>${flat.rooms} кімнати</h2>
                            <h2 class="found__type"><i class='bx bx-home-alt-2'></i>${flat.type}</h2>
                            <h2 class="found__price"><i class='bx bx-purchase-tag'></i>${flat.price} грн/доба</h2>
                        </div>
                    </a>    
                    <button class="button found__button">Забронювати</button>
                </div>`;

            i++;
        } while (i < flats.length);

        addBookingEventListeners(flats);
    })
    .catch(error => console.error("Помилка завантаження JSON:", error));

function addBookingEventListeners(flats) {
    const modal = document.getElementById("bookingModal");
    const closeModal = document.querySelector(".close");
    const datePicker = document.getElementById("datePicker");
    const confirmBooking = document.getElementById("confirmBooking");
    const priceDisplay = document.querySelector(".modal__price span");

    function disableDates() {
        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        const flat = JSON.parse(modal.dataset.flat);

        let bookedDates = bookings
            .filter(b => b.address === flat.address)
            .flatMap(b => b.dates.split('-'));

        flatpickr(datePicker, {
            mode: "range",
            dateFormat: "d.m.Y",
            minDate: "today",
            locale: "uk",
            disable: bookedDates,
            onChange: function (selectedDates, dateStr, instance) {
                instance.element.value = dateStr.replace('to', '-');
                updatePrice(selectedDates);
            }
        });
    }

    function updatePrice(selectedDates) {
        const flat = JSON.parse(modal.dataset.flat);
        const startDate = selectedDates[0];
        const endDate = selectedDates[selectedDates.length - 1];
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const pricePerNight = flats.find(f => f.location === flat.address).price;
        const totalPrice = nights * pricePerNight;
        priceDisplay.textContent = `${totalPrice} грн`;
    }

    const buttons = document.querySelectorAll(".found__button");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            modal.style.display = "flex";
            const flatCard = this.closest(".found__card");
            const address = flatCard.querySelector(".found__title").textContent.trim();
            const flatData = flats.find(f => f.location === address);
    
            modal.dataset.flat = JSON.stringify({
                link: flatCard.querySelector(".found__link").href,
                img: flatCard.querySelector(".found__img").src,
                address: address,
                price: flatData.price
            });
    
            priceDisplay.textContent = `${flatData.price} грн/доба`;
            disableDates();
        });
    }
    

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        datePicker.value = "";
        flatpickr(datePicker).clear();
    });

    confirmBooking.addEventListener("click", () => {
        const selectedDates = datePicker.value.split('-');
        if (selectedDates.length !== 2) {
            alert("Потрібно вибрати рівно 2 дати: початок і кінець бронювання.");
            return;
        }
    
        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        const flat = JSON.parse(modal.dataset.flat);
        const isAlreadyBooked = bookings.some(b => b.address === flat.address && b.dates === datePicker.value);
    
        if (isAlreadyBooked) {
            alert("Ця квартира вже заброньована на вибрані дати. Виберіть інші.");
            return;
        }
    
        flat.dates = datePicker.value;
        flat.totalPrice = priceDisplay.textContent;
        bookings.push(flat);
    
        localStorage.setItem("bookings", JSON.stringify(bookings));
        modal.style.display = "none";
    
        document.getElementById("successModal").style.display = "flex";
        datePicker.value = "";
        flatpickr(datePicker).clear();
    });
    
    document.getElementById("successOk").addEventListener("click", () => {
        document.getElementById("successModal").style.display = "none";
    });
    document.querySelector("#successModal .close").addEventListener("click", () => {
        document.getElementById("successModal").style.display = "none";
    });
}

