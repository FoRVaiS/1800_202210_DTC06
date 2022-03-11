function populateCardsDynamically() {
    let hikeCardTemplate = document.getElementById("hikeCardTemplate");
    let hikeCardGroup = document.getElementById("hikeCardGroup");

    db.collection("Restaurants").get()
        .then(allHikes => {
            allHikes.forEach(doc => {
                var hikeName = doc.data().name; //gets the name field
                var hikeID = doc.data().id; //gets the unique ID field
                var description = doc.data().description; //gets the length field
                var image = doc.data().image;
                let testHikeCard = hikeCardTemplate.content.cloneNode(true);
                testHikeCard.querySelector('.card-title').innerHTML = hikeName;
                testHikeCard.querySelector('.card-length').innerHTML = description;
                testHikeCard.querySelector('a').onclick = () => setHikeData(hikeID);
                testHikeCard.querySelector('img').src = image;
                hikeCardGroup.appendChild(testHikeCard);
            })
        })
}

populateCardsDynamically();

function setHikeData(id) {
    localStorage.setItem('hikeID', id);
}

// called on page startup and waits for function to be implemented
$(document).ready(main);

// in js functions are from bottom --> top