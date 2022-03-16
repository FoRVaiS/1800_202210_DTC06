function populateCardsDynamically() {
    let restaurantCardTemplate = document.getElementById("restaurantCardTemplate");
    let restaurantCardGroup = document.getElementById("restaurantCardGroup");

    db.collection("Restaurants").get()
        .then(allRestaurants => {
            allRestaurants.forEach(doc => {
                var restaurantName = doc.data().name;
                var restaurantID = doc.data().id;
                var restaurantDescription = doc.data().description;
                var image = doc.data().image;

                let testRestaurantCard = restaurantCardTemplate.content.cloneNode(true);
                testRestaurantCard.querySelector(".card-title").innerHTML = restaurantName;
                testRestaurantCard.querySelector(".card-length").innerHTML = restaurantDescription;
                testRestaurantCard.querySelector("a").onclick = () => setRestaurantData(restaurantID);
                testRestaurantCard.querySelector("img").src = image;

                restaurantCardGroup.appendChild(testRestaurantCard);
            })
        })
}

populateCardsDynamically();

function setRestaurantData(id) {
    localStorage.setItem("restaurantID", id);
}