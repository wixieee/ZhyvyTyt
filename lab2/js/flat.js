document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get("id");

    fetch("json/apartments.json")
        .then(response => response.json())
        .then(data => {
            const apartment = data.find(item => item.id == apartmentId);
            if (apartment) {
                loadApartment(apartment);
                initMap(apartment);
                addBookingEventListeners(data);
            } else {
                console.error("Квартира не знайдена");
            }
        })
        .catch(error => console.error("Помилка завантаження даних:", error));
});

function loadApartment(apartment) {
    document.querySelector('.general__title').textContent = apartment.location;
    document.querySelectorAll('.info__item span')[0].textContent = apartment.location;
    document.querySelectorAll('.info__item span')[1].textContent = apartment.type;
    document.querySelectorAll('.info__item span')[2].textContent = apartment.size + " м²";
    document.querySelector('.rent__price-value').textContent = apartment.price + " грн/місяць";
    document.querySelector('.description__text-item').textContent = apartment.description;

    let swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.innerHTML = '';

    apartment.images.forEach(imgSrc => {
        let slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.innerHTML = `<img src="${imgSrc}" class="slider-image" alt="Фото квартири">`;
        swiperWrapper.appendChild(slide);
    });

    new Swiper('.mySwiper', {
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        }
    });

    document.querySelectorAll('.slider-image').forEach(img => {
        img.addEventListener('click', function () {
            document.getElementById("imageModal").style.display = "flex";
            document.getElementById("modalImg").src = this.src;
        });
    });

    document.querySelector('.ImgClose').addEventListener('click', function () {
        document.getElementById("imageModal").style.display = "none";
    });

    document.getElementById("imageModal").addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = "none";
        }
    });
}

function initMap(apartment) {
    const map = L.map("map", {
        center: [apartment.lat, apartment.lng],
        zoom: 15,
        gestureHandling: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([apartment.lat, apartment.lng]).addTo(map)
        .bindPopup(`<b>${apartment.location}</b><br>Ціна: ${apartment.price} грн/доба`)
        .openPopup();
}

function addBookingEventListeners(flats) {
    const modal = document.getElementById("bookingModal");
    const closeModal = document.querySelector(".close");
    const datePicker = document.getElementById("datePicker");
    const confirmBooking = document.getElementById("confirmBooking");
    const priceDisplay = document.querySelector(".modal__price span");
    const rentButton = document.querySelector(".rent__button");

    if (!rentButton) {
        console.error("Кнопка бронювання не знайдена");
        return;
    }

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
        const flatData = flats.find(f => f.location === flat.address);

        if (!flatData) {
            console.error(`Не знайдено квартиру з адресою: ${flat.address}`);
            return;
        }

        const totalPrice = nights * flatData.price;
        priceDisplay.textContent = `${totalPrice} грн`;
    }

    rentButton.addEventListener("click", function () {
        modal.style.display = "flex";
        const flatTitle = document.querySelector(".general__title").textContent.trim();
        const flatData = flats.find(f => f.location === flatTitle);
    
        if (!flatData) {
            console.error("Квартира не знайдена у flats");
            return;
        }
    
        const flatImage = flatData.images?.[0];
        const flatPrice = document.querySelector(".rent__price-value").textContent.trim();
        const flatLink = window.location.href;
    
        modal.dataset.flat = JSON.stringify({
            link: flatLink,
            img: flatImage,
            address: flatTitle,
            price: flatData.price
        });
    
        priceDisplay.textContent = `${flatData.price} грн/доба`;
        disableDates();
    });

    closeModal.addEventListener("click", () => {
        if (modal.style.display != "none"){
            modal.style.display = "none";
        }
        else{
            modal.style.display = "block";
        }
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

        document.getElementById("successOk").addEventListener("click", () => {
            document.getElementById("successModal").style.display = "none";
        });
        document.querySelector("#successModal .close").addEventListener("click", () => {
            document.getElementById("successModal").style.display = "none";
        });
        disableDates();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const goBackBtn = document.getElementById("goBack");
    if (goBackBtn) {
        goBackBtn.addEventListener("click", function (event) {
            event.preventDefault();
            if (document.referrer) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }
});