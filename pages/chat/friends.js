//** Show is list of all users EXCEPT me (who is logged in) */
function showAllUsers() {
    firebase.auth().onAuthStateChanged(user => {
        // if user is an actual user
        if (user) {
            myid = user.uid;
            // get all users from firestore db collection
            db.collection("users").get()
                .then(snap => {
                    // use a for each loop to itterate the collection
                    snap.forEach(doc => {
                        // if there are users that are not me
                        if (doc.id != myid) {
                            let newCard = document.getElementById("card-template")
                                .content.cloneNode(true);
                            newCard.querySelector('.card-name').innerHTML = doc.data().name;
                            newCard.querySelector('.card-href').href = "chat.html?uid=" +
                                doc.id + "&name=" + doc.data().name; //pass name and id
                            // append the list of users to the div
                            document.getElementById("friends-go-here").appendChild(newCard);
                        }
                    })
                })
        } else {
            // No user is signed in.
            console.log("no user signed in");
        }
    })
}
showAllUsers();