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
                $("#party_member").text(user_Name); //jquery
                // document.getElementById("party_member").innetText = user_Name;
            })
        }

    })
}
insertName();