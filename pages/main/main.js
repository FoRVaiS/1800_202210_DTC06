(() => {
    const { fetchCurrentUserDocument, fetchDocuments } = window.comidas.exports;

    function populateCardsDynamically(type) {
        const suggestionsCardTemplate = document.querySelector("section[region='suggestions'] template#suggestions_card");
        const suggestionsCardGroup = document.querySelector("section[region='suggestions'] .u-card-group");

        fetchDocuments(type)
            .then(docs => docs.forEach(doc => {
                const { name, id, description, image } = doc.data();

                const suggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                suggestionCard.querySelector('.card-title').innerHTML = name;
                suggestionCard.querySelector('.card-length').innerHTML = description;
                suggestionCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
                suggestionCard.querySelector('img').src = image;

                suggestionsCardGroup.appendChild(suggestionCard);
            }))
            .catch(console.error);
    }

    fetchCurrentUserDocument()
        .then(userDoc => userDoc.data())
        .then(data => {
            populateCardsDynamically(data.type);
        })
        .catch(console.error);
})();
