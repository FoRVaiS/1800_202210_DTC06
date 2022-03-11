var currentUser          //put this right after you start script tag before writing any functions.

function populateInfo() {
    firebase.auth().onAuthStateChanged(user => {

        //go to the correct user document by referencing to the user uid
        currentUser = db.collection("users").doc(user.uid)
        //get the document for current user.
        currentUser.get().then(userDoc => {
            //get the data fields of the user
            var userName = userDoc.data().name;
            var userEmail = userDoc.data().email;
            var userCountry = userDoc.data().country;
            var userLanguage = userDoc.data().language;

            //if the data fields are not empty, then write them in to the form.
            if (userName != null) {
                document.getElementById("nameInput").value = userName;
            }

            if (userEmail != null) {
                document.getElementById("emailInput").value = userEmail;
            }

            if (userCountry != null) {
                document.getElementById("countryInput").value = userCountry;
            }

            if (userLanguage != null) {
                document.getElementById("userLanguage").value = userLanguage;
            }

            /* How to select the language into <select> ? */

        });
    });
}

//call the function to run it
populateInfo();

function editUserInfo(){
    //Make the form fields in profile.html editable
    document.getElementById('personalInfoInput').disabled = false;
};

function saveUserInfo(){

    //Save data from user

    userName = document.getElementById('nameInput').value;
    userEmail = document.getElementById('emailInput').value;
    userCountry = document.getElementById('countryInput').value;
    userLanguage = document.getElementById('languageInput').value;

    firebase.aut().onAuthStateChanged(user => {

        //go to the correct user document by referencing to the user uid
        currentUser = db.collection("users").doc(user.uid)

        // write/update the database
        currentUser.update({
            name: userName,
            email: userEmail,
            country: userCountry,
            language: userLanguage
        })

        .then(() => {
            alert("Your info is successfully saved!")
            document.getElementById('personalInfoInput').disabled=true;
        });
    });
}