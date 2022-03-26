(() => {
    let currentUser; // put this right after you start script tag before writing any functions.

    $('#personalInfoInput').hide();

    function populateInfo() {
        firebase.auth().onAuthStateChanged(user => {
        // go to the correct user document by referencing to the user uid
            currentUser = db.collection('users').doc(user.uid);

            // get the document for current user.
            currentUser.get().then(userDoc => {
            // get the data fields of the user
                const userName = userDoc.data().name;
                const userEmail = userDoc.data().email;
                const userCountry = userDoc.data().country;
                const { type } = userDoc.data();
                const userBio = userDoc.data().bio;

                // select the elements that we want to inject our data into
                const injectName = document.querySelector('#displayName');
                const injectCountry = document.querySelector('#displayCountry');
                const injectBio = document.querySelector('#displayBio');

                // inject data into placeholders
                injectName.innerHTML = userName;
                injectCountry.innerHTML = userCountry;
                injectBio.innerHTML = userBio;

                // if the data fields are not empty, then write them in to the form.
                if (userName !== null) document.getElementById('nameInput').value = userName;
                if (userEmail !== null) document.getElementById('emailInput').value = userEmail;
                if (userCountry !== null) document.getElementById('countryInput').value = userCountry;
                if (type !== null) document.querySelector(`#in-group-type > option[value='${type}']`).setAttribute('selected', true);
                if (userBio !== null) document.getElementById('bioInput').value = userBio;

            /* How to select the language into <select> ? */
            });
        });
    }

    // call the function to run it
    populateInfo();


    // eslint-disable-next-line no-unused-vars
    function editUserInfo() {
        $('#personalInfoInput').toggle();

        // Make the form fields in profile.html editable
        document.getElementById('personalInfoInput').disabled = false;
    }

    // eslint-disable-next-line no-unused-vars
    function saveUserInfo() {
    // Save data from user

        const userName = document.getElementById('nameInput').value;
        const userEmail = document.getElementById('emailInput').value;
        const groupType = document.getElementById('in-group-type').value;
        const userBio = document.getElementById('bioInput').value;

        firebase.auth().onAuthStateChanged(user => {
        // go to the correct user document by referencing to the user uid
            currentUser = db.collection('users').doc(user.uid);

            // write/update the database
            currentUser.update({
                name: userName,
                email: userEmail,
                type: groupType,
                bio: userBio,
            })
                .then(() => {
                    document.getElementById('personalInfoInput').disabled = true;
                });
        });

        $('#personalInfoInput').hide();
    }

    function createCard({ name: title, description, address, image, id }) {
        const testHikeCard = document.querySelector('#profile__fav-card').content.cloneNode(true);
        testHikeCard.querySelector('.fav-card__title').innerText = title;
        testHikeCard.querySelector('.fav-card__description').innerText = description;
        testHikeCard.querySelector('.fav-card__location').innerText = address;
        testHikeCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
        testHikeCard.querySelector('img').src = image;

        document.querySelector('#fav-card__group').appendChild(testHikeCard);
    }

    firebase.auth().onAuthStateChanged(async userAuthObj => {
        if (!userAuthObj) return null;

        const user = await db.collection('users').doc(userAuthObj.uid).get();
        const data = user.data();

        const snapshotPromises = data.favourites.map(code => db.collection(data.type).where('id', '==', code.toUpperCase()).get());

        const snapshots = await Promise.all(snapshotPromises);

        return snapshots
            .map(snapshot => snapshot.docs[0].data())
            .forEach(createCard);
    });
})();
