(async () => {
    const MEMBERS_PER_GROUP = 5;

    const { fetchCurrentUserDocument, fetchDocuments, fetchDocument } = window.comidas.exports;

    async function fetchGroupsByType(groupType) {
        const docs = await fetchDocuments('groups', { where: [`type == ${groupType}`] });

        return docs.filter(doc => doc.data().members.length <= MEMBERS_PER_GROUP);
    }

    async function fetchGroupById(groupId) {
        const groupDoc = await fetchDocument('groups', groupId);

        return groupDoc ?? null;
    }

    async function createGroup(type, userUid) {
        return (await db.collection('groups').add({
            type,
            members: [db.doc(`/users/${userUid}`)],
        })).get();
    }

    async function joinGroup(uid, groupType) {
        const userDoc = await fetchCurrentUserDocument(uid);

        let [[group], oldGroup] = await Promise.all([
            fetchGroupsByType(groupType),
            fetchGroupById(userDoc.data().groupId),
        ]);

        if (!group) group = await createGroup(groupType, uid);

        const userRef = db.doc(`/users/${uid}`);

        if (oldGroup.exists) oldGroup.ref.update({
            members: firebase.firestore.FieldValue.arrayRemove(userRef),
        });

        const groupUpdate = group.ref.update({
            members: firebase.firestore.FieldValue.arrayUnion(userRef),
        });

        const userUpdate = userDoc.ref.update({
            groupId: group.ref.id,
        });

        await Promise.all([groupUpdate, userUpdate]);

        return fetchGroupById(group.ref.id);
    }

    function appendMemberToView({ name }) {
        const memberRow = document.querySelector('#t-member').content.cloneNode(true);
        memberRow.querySelector('.member__name').textContent = name;

        document.querySelector("section[region='group'").append(memberRow);
    }

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

    try {
        const userDoc = await fetchCurrentUserDocument();
        const userData = userDoc.data();

        let currentGroup = await fetchGroupById(userData.groupId);

        if (!currentGroup.exists) currentGroup = await joinGroup(userDoc.ref.id, userData.type);
        if (!userData.groupId) currentGroup = await joinGroup(userDoc.ref.id, userData.type);
        if (currentGroup.data().type !== userData.type) currentGroup = await joinGroup(userDoc.ref.id, userData.type);

        const memberDocs = await Promise.all(currentGroup.data().members.map(reference => reference.get()));

        memberDocs.map(doc => doc.data()).forEach(appendMemberToView);
        populateCardsDynamically(userData.type);
    } catch (e) {
        console.error(e);
    }
})();
