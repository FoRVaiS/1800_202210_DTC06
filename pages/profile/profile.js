var currentUser          //put this right after you start script tag before writing any functions.

$('#personalInfoInput').hide();

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
            var userBio = userDoc.data().bio;

            // select the elements that we want to inject our data into
            var injectName = document.querySelector("#displayName")
            var injectCountry = document.querySelector('#displayCountry')
            var injectLanguage = document.querySelector('#displayLanguage')
            var injectBio = document.querySelector('#displayBio');

            // inject data into placeholders
            injectName.innerHTML = userName;
            injectCountry.innerHTML = userCountry;
            injectLanguage.innerHTML = userLanguage;
            injectBio.innerHTML = userBio;

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
                document.getElementById("languageInput").value = userLanguage;
            }

            if (userBio != null) {
                document.getElementById('bioInput').value = userBio;
            }

            /* How to select the language into <select> ? */

        });
    });
}

//call the function to run it
populateInfo();

function editUserInfo() {
    $('#personalInfoInput').toggle();
    //Make the form fields in profile.html editable
    document.getElementById('personalInfoInput').disabled = false;
};

function saveUserInfo() {

    //Save data from user

    userName = document.getElementById('nameInput').value;
    userEmail = document.getElementById('emailInput').value;
    userCountry = document.getElementById('countryInput').value;
    userLanguage = document.getElementById('languageInput').value;
    userBio = document.getElementById('bioInput').value;

    firebase.auth().onAuthStateChanged(user => {

        //Check if user has signed in:
        // if (user) {
            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid)

            // write/update the database
            currentUser.update({
                name: userName,
                email: userEmail,
                country: userCountry,
                language: userLanguage,
                bio: userBio
            })

                .then(() => {
                    alert("Your info is successfully saved!");
                    document.getElementById('personalInfoInput').disabled = true;
                });
        })
    // });

    $('#personalInfoInput').hide();
}

(() => {
    function createCard({ name: title, description, address, image }, index = 0) {
        const testHikeCard = document.querySelector('#profile__fav-card').content.cloneNode(true);
        testHikeCard.querySelector('.fav-card__title').innerText = title;
        testHikeCard.querySelector('.fav-card__description').innerText = description;
        testHikeCard.querySelector('.fav-card__location').innerText = address;
        testHikeCard.querySelector('img').src = image;
        
        document.querySelector('#fav-card__group').appendChild(testHikeCard);
    }

    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) return null;

        const userDoc = await db.collection('users').doc(user.uid).get();
        const { type, favourites } = userDoc.data();

        const docsPromises = favourites.map(code => db.collection(type).where('id', '==', code.toUpperCase()).get());

        const docs = (await Promise.all(docsPromises)).map(({ docs }) => docs[0].data());

        docs.forEach(createCard);
    });
})();
