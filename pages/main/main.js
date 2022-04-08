(async () => {
    const MEMBERS_PER_GROUP = 5;

    const { fetchCurrentUserDocument, fetchDocuments, fetchDocument } = window.comidas.exports;

    /**
     * Fetch multiple groups by group type.
     *
     * @param {string} groupType Group Type.
     * @returns {Promise<object[]>} An array of groups filtered by group type.
     * */
    async function fetchGroupsByType(groupType) {
        const docs = await fetchDocuments('groups', { where: [`type == ${groupType}`] });

        return docs.filter(doc => doc.data().members.length <= MEMBERS_PER_GROUP);
    }

    /**
     * Fetch a single group by group ID.
     *
     * @param {string} groupId Group ID.
     * @returns {object | null} Group document.
     */
    async function fetchGroupById(groupId) {
        const groupDoc = await fetchDocument('groups', groupId);

        return groupDoc ?? null;
    }

    /**
     * Create a group document in Firestore.
     *
     * @param {string} type Group type.
     * @param {string} userUid User UID.
     * @returns {Promise<object>} Group document.
     */
    async function createGroup(type, userUid) {
        return (await db.collection('groups').add({
            type,
            members: [db.doc(`/users/${userUid}`)],
        })).get();
    }

    /**
     * Join the first available/open group in an activity category.
     *
     * @param {string} uid User UID.
     * @param {string} groupType Group Type.
     * @return {object} Group document.
     */
    async function joinGroup(uid, groupType) {
        const userDoc = await fetchCurrentUserDocument(uid);

        let [[group], oldGroup] = await Promise.all([
            fetchGroupsByType(groupType),
            fetchGroupById(userDoc.data().groupId),
        ]);

        // If there are no existing group, create it
        if (!group) group = await createGroup(groupType, uid);

        const userRef = db.doc(`/users/${uid}`);

        // Remove the user from their old group
        if (oldGroup.exists) oldGroup.ref.update({
            members: firebase.firestore.FieldValue.arrayRemove(userRef),
        });

        // Add the user to the new group
        const groupUpdate = group.ref.update({
            members: firebase.firestore.FieldValue.arrayUnion(userRef),
        });

        // Set the user's groupId to their new group's document UID
        const userUpdate = userDoc.ref.update({
            groupId: group.ref.id,
        });

        await Promise.all([groupUpdate, userUpdate]);

        return fetchGroupById(group.ref.id);
    }

    /**
     * Append a member to the group list.
     *
     * @param {string} name User name.
     * @param {string} id User UID.
     */
    function appendMemberToView(name, id) {
        const memberRow = document.querySelector('#t-member').content.cloneNode(true);
        memberRow.querySelector('.member').setAttribute('href', `../profile/profile.html?id=${id}`);
        memberRow.querySelector('.member__name').textContent = name;

        document.querySelector("section[region='group'").append(memberRow);
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

    /**
     * Populate suggestion cards with data from an activity category.
     *
     * @param {string} type Activity Type.
     */
    function populateCardsDynamically(type) {
        const suggestionsCardTemplate = document.querySelector("section[region='suggestions'] template#suggestions_card");
        const suggestionsCardGroup = document.querySelector("section[region='suggestions'] .u-card-group");

        fetchDocuments(type)
            .then(docs => docs.forEach(async doc => {
                const { name, id, description, image } = doc.data();

                const suggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                const bookmarkRef = suggestionCard.querySelector('.bookmark');

                displayBookmarkState(bookmarkRef, await fetchBookmarkState(id))

                suggestionCard.querySelector('.card');
                suggestionCard.querySelector('.card-title').innerHTML = name;
                suggestionCard.querySelector('.card-text').innerHTML = description;
                suggestionCard.querySelector('.card-btn').onclick = () => window.location.assign(`../page_info_template/page_info_template.html?code=${id.toUpperCase()}`);
                suggestionCard.querySelector('img').src = image;

                bookmarkRef.onclick = () => toggleBookmarkState(bookmarkRef, id);

                suggestionsCardGroup.appendChild(suggestionCard);

            }))
            .catch(console.error);
    }

    try {
        const userDoc = await fetchCurrentUserDocument();
        const userData = userDoc.data();

        let currentGroup = await fetchGroupById(userData.groupId);

        // If no group for this activity category exists, create one.
        if (!currentGroup.exists) currentGroup = await joinGroup(userDoc.ref.id, userData.type);

        // If the user is not assigned to a group, join a group.
        if (!userData.groupId) currentGroup = await joinGroup(userDoc.ref.id, userData.type);

        // If the user's group type does not match their current group type, join a new group.
        if (currentGroup.data().type !== userData.type) currentGroup = await joinGroup(userDoc.ref.id, userData.type);

        // Fetch all group members
        const memberDocs = await Promise.all(currentGroup.data().members.map(reference => reference.get()));

        // Add each group members to the party view.
        memberDocs.forEach(doc => appendMemberToView(doc.data().name, doc.ref.id));

        // Populate suggestions area.
        populateCardsDynamically(userData.type);
    } catch (e) {
        console.error(e);
    }
})();
