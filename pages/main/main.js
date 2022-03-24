function read_display_User() {
    // console.log("inside the function")

    // get into the right collection
    db.collection("users").doc("groups")
        .onSnapshot(groupsDoc => {
            // console.log(groupsDoc.data());
            document.getElementById("username").innerHTML = groupsDoc.data().user;
        })
}
read_display_User();

function insertName() {
    // to check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid); // let me to know who is the user that logged in to get the UID
            currentUser = db.collection("users").doc(user.uid); // will go to the firestore and go to the document
            currentUser.get().then(userDoc => {
                // get the user name
                var user_Name = userDoc.data().name;
                console.log(user_Name);
                $("#party__member-name").text(user_Name); //jquery
                // document.getElementById("party_member").innetText = user_Name;
            })
        }

    })
}
insertName();

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
                // var suggestionID = doc.data().id;
                // var suggestionDescription = doc.data().description;
                // var suggestionImage = doc.data().image;

                let testSuggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                testSuggestionCard.querySelector(".card-title").innerHTML = suggestionName;
                // testSuggestionCard.querySelector(".card-length").innerHTML = suggestionDescription;
                // testSuggestionCard.querySelector("a").onclick = () => setSuggestionData(suggestionID);
                // testSuggestionCard.querySelector("img").src = suggestionImage;

                suggestionsCardGroup.appendChild(testSuggestionCard);
            })
        })
}

function setSuggestionData(id) {
    localStorage.setItem("suggestionID", id);
}