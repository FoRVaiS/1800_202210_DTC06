(async () => {
    $('#personalInfoInput').hide();

    const { fetchCurrentUserDocument, fetchDocument, fetchDocuments, readUrlParams } = window.comidas.exports;
    const params = readUrlParams();

    // get the document for current user.
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

    /** Toggles the edit user profile menu. */
    function editUserInfo() {
        $('#personalInfoInput').toggle();

        // Make the form fields in profile.html editable
        document.getElementById('personalInfoInput').disabled = false;
    }

    /** Updates the user document with values from input form */
    function saveUserInfo() {
        const userName = document.getElementById('nameInput').value;
        const userEmail = document.getElementById('emailInput').value;
        const groupType = document.getElementById('in-group-type').value;
        const userBio = document.getElementById('bioInput').value;

        // write/update the database
        fetchDocument('users', params.id)
            // Update operation
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

    /**
     *
     * @param {object} suggestionInfo Details of a suggestion preview card.
     * @param {string} suggestionInfo.name Name of the suggestion.
     * @param {string} suggestionInfo.description Description of the suggestion.
     * @param {string} suggestionInfo.address Address of the suggestion.
     * @param {string} suggestionInfo.image Image URL of the suggestion.
     * @param {string} suggestionInfo.id ID of the suggestion.
     */
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

    /**
     * Set bookmark fill state.
     *
     * @param {HTMLElement} ref A document reference to a bookmark icon.
     * @param {boolean} shouldToggle Should the icon be filled?
     */
    function displayBookmarkState(ref, shouldToggle) {
        if (shouldToggle) {
            ref.classList.remove('bi-bookmark');
            ref.classList.add('bi-bookmark-fill');
        } else {
            ref.classList.remove('bi-bookmark-fill');
            ref.classList.add('bi-bookmark');
        }
    }

    /**
     * Fetch the current bookmark state by checking if an activity is in a user's favourites.
     *
     * @param {string} id Activity ID.
     * @returns {boolean} Does user have this activity favourited?
     */
    async function fetchBookmarkState(id) {
        const snapshot = await fetchCurrentUserDocument();

        return snapshot.data().favourites.includes(id.toUpperCase());
    }

    /**
     * Toggle the bookmark state
     *
     * @param {HTMLElement} ref A document reference to a bookmark icon.
     * @param {string} id Activity ID.
     */
    async function toggleBookmarkState(ref, id) {
        const snapshot = await fetchCurrentUserDocument();
        const currentState = await fetchBookmarkState(id);

        if (!currentState) {
            displayBookmarkState(ref, true);
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayUnion(id.toUpperCase()) })
        } else {
            displayBookmarkState(ref, false)
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayRemove(id.toUpperCase()) })
        }
    }

    // Fetch all the suggestion documents that are favourited based on the viewd user's profile.
    await fetchDocument('users', params.id)
        .then(userDoc => userDoc.data())
        .then(data => Promise.all(data.favourites.map(code => fetchDocuments(data.type, { where: [`id == ${code.toUpperCase()}`] }))))
        .then(suggestionDocs => suggestionDocs.flat().map(doc => doc.data()).forEach(createCard))
        .catch(console.error);
})();
