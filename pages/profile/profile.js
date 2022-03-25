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
            var type = userDoc.data().type;
            var userBio = userDoc.data().bio;

            // select the elements that we want to inject our data into
            var injectName = document.querySelector("#displayName")
            var injectCountry = document.querySelector('#displayCountry')
            var injectType = document.querySelector('#in-group-type')
            var injectBio = document.querySelector('#displayBio');

            // inject data into placeholders
            injectName.innerHTML = userName;
            injectCountry.innerHTML = userCountry;
            // injectType.innerHTML = type;
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

            if (type != null) {
                console.log(`#in-group-type > option[value='${type}']`);
                document.querySelector(`#in-group-type > option[value='${type}']`).setAttribute('selected', true);
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
    groupType = document.getElementById('in-group-type').value;
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
                type: groupType,
                bio: userBio
            })

                .then(() => {
                    document.getElementById('personalInfoInput').disabled = true;
                });
        })
    // });

    $('#personalInfoInput').hide();
}

(() => {
    function createCard({ name: title, description, address, image, id }, index = 0) {
        const testHikeCard = document.querySelector('#profile__fav-card').content.cloneNode(true);
        testHikeCard.querySelector('.fav-card__title').innerText = title;
        testHikeCard.querySelector('.fav-card__description').innerText = description;
        testHikeCard.querySelector('.fav-card__location').innerText = address;
        testHikeCard.querySelector(".card-btn").onclick = () => window.location.assign('../page_info_template/page_info_template.html?code=' + id.toUpperCase());
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
