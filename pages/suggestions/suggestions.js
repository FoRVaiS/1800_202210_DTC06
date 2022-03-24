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

function populateCardsDynamically(type) {
    let suggestionsCardTemplate = document.getElementById("suggestionsCardTemplate");
    let suggestionsCardGroup = document.getElementById("suggestionsCardGroup");
    db.collection(type).get()
        .then(allSuggestion => {
            allSuggestion.forEach(doc => {
                var suggestionName = doc.data().name;
                var suggestionID = doc.data().id;
                var suggestionDescription = doc.data().description;
                var suggestionImage = doc.data().image;

                let testSuggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                testSuggestionCard.querySelector(".card-title").innerHTML = suggestionName;
                testSuggestionCard.querySelector(".card-length").innerHTML = suggestionDescription;
                testSuggestionCard.querySelector("a").onclick = () => setSuggestionData(suggestionID);
                testSuggestionCard.querySelector("img").src = suggestionImage;

                suggestionsCardGroup.appendChild(testSuggestionCard);
            })
        })
}

function setSuggestionData(id) {
    localStorage.setItem("suggestionID", id);
}