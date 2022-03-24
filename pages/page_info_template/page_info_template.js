var currentUser;
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data();
            if (data.type == "activities") {
                populateCardsDynamically(data.type);
            }

            if (data.type == "restaurants") {
                populateCardsDynamically(data.type);
            }

            if (data.type == "sightsee") {
                populateCardsDynamically(data.type);
            }
        });
    }
});

async function populateCardsDynamically(type) {
    const params = Object.fromEntries(window.location.search.substring(1).split('&').map(param => param.split('=')));

    var snapshot = await db.collection(type).where('id', '==', params.code).get()

    var [doc] = snapshot.docs;

    let infoCardTemplate = document.getElementById("infoCardTemplate");
    let infoCardGroup = document.getElementById("infoCardGroup");

    var infoCardImage = doc.data().image;
    var infoCardName = doc.data().name;
    var infoCardAddress = doc.data().address;
    var infoCardHours = doc.data().hours;
    var infoCardWebsite = doc.data().website;
    var infoCardPhone = doc.data().phone;

    let testInfoCard = infoCardTemplate.content.cloneNode(true);

    testInfoCard.querySelector("img").src = infoCardImage;
    testInfoCard.querySelector(".card-title").innerHTML = infoCardName;
    testInfoCard.querySelector(".card-address").innerHTML = infoCardAddress;
    testInfoCard.querySelector(".card-hours").innerHTML = infoCardHours;
    testInfoCard.querySelector(".card-website").innerHTML = infoCardWebsite;
    testInfoCard.querySelector(".card-phone").innerHTML = infoCardPhone;

    infoCardGroup.appendChild(testInfoCard);
}

function setSuggestionData(id) {
    localStorage.setItem("infoCardID", id);
}