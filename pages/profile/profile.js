(async () => {
    $('#personalInfoInput').hide();

    const { fetchCurrentUserDocument, fetchDocument, fetchDocuments, readUrlParams } = window.comidas.exports;
    const params = readUrlParams();

    // get the document for current user.
    // fetchCurrentUserDocument()
    await fetchDocument('users', params.id)
        .then(userDoc => {
            // get the data fields of the user
            const userName = userDoc.data().name;
            const userEmail = userDoc.data().email;
            const { type } = userDoc.data();
            const userBio = userDoc.data().bio;

            // select the elements that we want to inject our data into
            const injectName = document.querySelector('#displayName');
            const injectBio = document.querySelector('#displayBio');

            // inject data into placeholders
            injectName.innerHTML = userName;
            injectBio.innerHTML = userBio;

            // if the data fields are not empty, then write them in to the form.
            if (userName !== null) document.getElementById('nameInput').value = userName;
            if (userEmail !== null) document.getElementById('emailInput').value = userEmail;
            if (type !== null) document.querySelector(`#in-group-type > option[value='${type}']`).setAttribute('selected', true);
            if (userBio !== null) document.getElementById('bioInput').value = userBio;
        })
        .catch(console.error);

    function editUserInfo() {
        $('#personalInfoInput').toggle();

        // Make the form fields in profile.html editable
        document.getElementById('personalInfoInput').disabled = false;
    }

    // Save data from user
    function saveUserInfo() {
        const userName = document.getElementById('nameInput').value;
        const userEmail = document.getElementById('emailInput').value;
        const groupType = document.getElementById('in-group-type').value;
        const userBio = document.getElementById('bioInput').value;

        // write/update the database
        // fetchCurrentUserDocument()
        fetchDocument('users', params.id)
            .then(userDoc => userDoc.ref.update({
                name: userName,
                email: userEmail,
                type: groupType,
                bio: userBio,
            }))
            .then(() => {
                document.getElementById('personalInfoInput').disabled = true;
            })
            .catch(console.error);

        $('#personalInfoInput').hide();
    }

    document.querySelector('#editButton').onclick = editUserInfo;
    document.querySelector('#saveButton').onclick = saveUserInfo;

    async function createCard({ name: title, description, address, image, id }) {

        const testHikeCard = document.querySelector('#profile__fav-card').content.cloneNode(true);
        const bookmarkRef = testHikeCard.querySelector('.bookmark');
        displayBookmarkState(bookmarkRef, await fetchBookmarkState(id));
        bookmarkRef.onclick = () => toggleBookmarkState(bookmarkRef, id);

        testHikeCard.querySelector('.fav-card__title').innerText = title;
        testHikeCard.querySelector('.fav-card__description').innerText = description;
        testHikeCard.querySelector('.fav-card__location').innerText = address;
        testHikeCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
        testHikeCard.querySelector('img').src = image;

        document.querySelector('#fav-card__group').appendChild(testHikeCard);
    }

    function displayBookmarkState(ref, shouldToggle) {
        if (shouldToggle) {
            ref.classList.remove('bi-bookmark');
            ref.classList.add('bi-bookmark-fill');
        } else {
            ref.classList.remove('bi-bookmark-fill');
            ref.classList.add('bi-bookmark');
        }
    }

    async function fetchBookmarkState(id) {
        const snapshot = await fetchCurrentUserDocument();

        return snapshot.data().favourites.includes(id.toUpperCase());
    }

    async function toggleBookmarkState(ref, id) {
        const snapshot = await fetchCurrentUserDocument();
        const currentState = await fetchBookmarkState(id);

        if (!currentState) {
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayUnion(id.toUpperCase()) })
            displayBookmarkState(ref, true);
        } else {
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayRemove(id.toUpperCase()) })
            displayBookmarkState(ref, false)
        }
    }


    // fetchCurrentUserDocument()
    await fetchDocument('users', params.id)
        .then(userDoc => userDoc.data())
        .then(data => Promise.all(data.favourites.map(code => fetchDocuments(data.type, { where: [`id == ${code.toUpperCase()}`] }))))
        .then(suggestionDocs => suggestionDocs.flat().map(doc => doc.data()).forEach(createCard))
        .catch(console.error);
})();
