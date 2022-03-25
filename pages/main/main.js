function read_display_User() {
    // console.log("inside the function")

    // get into the right collection
    db.collection("users").doc("groups")
        .onSnapshot(groupsDoc => {
            // console.log(groupsDoc.data());
            document.getElementById("username").innerHTML = groupsDoc.data().user;
        })
}
// read_display_User();

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
// insertName();

(() => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection("users").doc(user.uid).get()
                .then(doc => {
                    const { type } = doc.data();
                    
                    populateCardsDynamically(type);
                });
        }
    });

    function populateCardsDynamically(type) {
        const suggestionsCardTemplate = document.querySelector("section[region='suggestions'] template#suggestions_card");
        const suggestionsCardGroup = document.querySelector("section[region='suggestions'] .u-card-group");

        db.collection(type).get()
            .then(allSuggestion => {
                allSuggestion.forEach(doc => {
                    const { name, id, description, image } = doc.data();

                    const suggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                    suggestionCard.querySelector(".card-title").innerHTML = name;
                    suggestionCard.querySelector(".card-length").innerHTML = description;
                    suggestionCard.querySelector("a").onclick = () => setSuggestionData(id);
                    suggestionCard.querySelector("img").src = image;

                    suggestionsCardGroup.appendChild(suggestionCard);
                })
            })
    }

    function setSuggestionData(id) {
        localStorage.setItem("suggestionID", id);
    }
})();
