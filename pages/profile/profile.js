(() => {
    $('#personalInfoInput').hide();

    const { fetchCurrentUserDocument, fetchDocuments } = window.comidas.exports;

    // get the document for current user.
    fetchCurrentUserDocument()
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
        fetchCurrentUserDocument()
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

    function createCard({ name: title, description, address, image, id }) {
        const testHikeCard = document.querySelector('#profile__fav-card').content.cloneNode(true);
        testHikeCard.querySelector('.fav-card__title').innerText = title;
        testHikeCard.querySelector('.fav-card__description').innerText = description;
        testHikeCard.querySelector('.fav-card__location').innerText = address;
        testHikeCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
        testHikeCard.querySelector('img').src = image;

        document.querySelector('#fav-card__group').appendChild(testHikeCard);
    }

    fetchCurrentUserDocument()
        .then(userDoc => userDoc.data())
        .then(data => Promise.all(data.favourites.map(code => fetchDocuments(data.type, { where: [`id == ${code.toUpperCase()}`] }))))
        .then(suggestionDocs => suggestionDocs.flat().map(doc => doc.data()).forEach(createCard))
        .catch(console.error);
})();
