(async () => {
    function populateCardsDynamically(type) {
        const suggestionsCardTemplate = document.querySelector("section[region='suggestions'] template#suggestions_card");
        const suggestionsCardGroup = document.querySelector("section[region='suggestions'] .u-card-group");

        db.collection(type).get()
            .then(allSuggestion => {
                allSuggestion.docs.forEach(doc => {
                    const { name, id, description, image } = doc.data();

                    const suggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                    suggestionCard.querySelector('.card-title').innerHTML = name;
                    suggestionCard.querySelector('.card-length').innerHTML = description;
                    suggestionCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
                    suggestionCard.querySelector('img').src = image;

                    suggestionsCardGroup.appendChild(suggestionCard);
                });
            });
    }

    firebase.auth().onAuthStateChanged(async user => {
        const snapshot = await db.collection('users').doc(user.uid).get();
        const data = snapshot.data();

        populateCardsDynamically(data.type);
    });
})();
