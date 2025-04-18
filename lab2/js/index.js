fetch("json/apartments.json")
    .then(response => response.json())
    .then(flats => {
        const container = document.getElementById('popular-container');
        container.innerHTML = "";

        for (let i = 0; i < 4 && i < flats.length; i++) {
            const flat = flats[i];

            container.innerHTML += `
                <a href="flat.html?id=${flat.id}" class="found__link">
                    <article class="popular__card">
                        <img src="${flat.images[0]}" class="popular__img">
                        <div class="popular__data">
                            <h2 class="popular__price">
                                <span>${flat.price} грн/доба</span>
                            </h2>
                            <h3 class="popular__title">
                                Площа: ${flat.size} m<sup>2</sup>
                            </h3>
                            <h3 class="popular__description">
                                ${flat.location}
                            </h3>
                        </div>
                    </article>
                </a>`;
        }
    })
    .catch(error => console.error("Помилка завантаження JSON:", error));

document.addEventListener("DOMContentLoaded", function () {
    const logo = document.querySelector(".footer__logo");

    if (logo) {
        logo.addEventListener("mouseenter", function () {
            this.style.color = "blue";
            this.style.transform = "scale(1.1)";
            this.style.transition = "all 0.3s ease";
        });

        logo.addEventListener("mouseleave", function () {
            this.style.color = "";
            this.style.transform = "scale(1)";
        });
    }
});

function changeText(button) {
    button.innerText = 'Очікуйте';
    setTimeout(() => {
        button.innerText = 'Замовити виклик';
    }, 3000);
}






