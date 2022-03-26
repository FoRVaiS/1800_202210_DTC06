(() => {
    async function populateCardsDynamically(type) {
        const params = Object.fromEntries(window.location.search.substring(1).split('&').map(param => param.split('=')));

        const snapshot = await db.collection(type).where('id', '==', params.code).get();

        const [doc] = snapshot.docs;

        const infoCardTemplate = document.getElementById('infoCardTemplate');
        const infoCardGroup = document.getElementById('infoCardGroup');

        const infoCardImage = doc.data().image;
        const infoCardName = doc.data().name;
        const infoCardAddress = doc.data().address;
        const infoCardHours = doc.data().hours;
        const infoCardWebsite = doc.data().website;
        const infoCardPhone = doc.data().phone;

        const testInfoCard = infoCardTemplate.content.cloneNode(true);

        testInfoCard.querySelector('img').src = infoCardImage;
        testInfoCard.querySelector('.card-title').innerHTML = infoCardName;
        testInfoCard.querySelector('.card-address').innerHTML = infoCardAddress;
        testInfoCard.querySelector('.card-hours').innerHTML = infoCardHours;
        testInfoCard.querySelector('.card-website').innerHTML = infoCardWebsite;
        testInfoCard.querySelector('.card-phone').innerHTML = infoCardPhone;

        infoCardGroup.appendChild(testInfoCard);
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                const data = doc.data();
                if (data.type === 'activities') {
                    populateCardsDynamically(data.type);
                }

                if (data.type === 'restaurants') {
                    populateCardsDynamically(data.type);
                }

                if (data.type === 'sightsee') {
                    populateCardsDynamically(data.type);
                }
            });
        }
    });
})();
