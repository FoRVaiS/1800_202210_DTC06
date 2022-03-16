function populateCardsDynamically() {
    let sightseeCardTemplate = document.getElementById("sightseeCardTemplate");
    let sightseeCardGroup = document.getElementById("sightseeCardGroup");

    db.collection("Sightsee").get()
        .then(allActivities => {
            allActivities.forEach(doc => {
                var sightseeName = doc.data().name;
                var sightseeID = doc.data().id;
                var sightseeDescription = doc.data().description;
                var image = doc.data().image;

                let testSightseeCard = sightseeCardTemplate.content.cloneNode(true);
                testSightseeCard.querySelector(".card-title").innerHTML = sightseeName;
                testSightseeCard.querySelector(".card-length").innerHTML = sightseeDescription;
                testSightseeCard.querySelector("a").onclick = () => setsightseeData(sightseeID);
                testSightseeCard.querySelector("img").src = image;

                sightseeCardGroup.appendChild(testSightseeCard);
            })
        })
}

populateCardsDynamically();

function setsightseeData(id) {
    localStorage.setItem("sightseeID", id);
}