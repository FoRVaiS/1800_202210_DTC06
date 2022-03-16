function populateCardsDynamically() {
    let activityCardTemplate = document.getElementById("activityCardTemplate");
    let activityCardGroup = document.getElementById("activityCardGroup");

    db.collection("Activities").get()
        .then(allActivities => {
            allActivities.forEach(doc => {
                var activityName = doc.data().name;
                var activityID = doc.data().id;
                var activityDescription = doc.data().description;
                var image = doc.data().image;

                let testActivityCard = activityCardTemplate.content.cloneNode(true);
                testActivityCard.querySelector(".card-title").innerHTML = activityName;
                testActivityCard.querySelector(".card-length").innerHTML = activityDescription;
                testActivityCard.querySelector("a").onclick = () => setActivityData(activityID);
                testActivityCard.querySelector("img").src = image;

                activityCardGroup.appendChild(testActivityCard);
            })
        })
}

populateCardsDynamically();

function setActivityData(id) {
    localStorage.setItem("activityID", id);
}