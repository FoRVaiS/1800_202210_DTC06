function read_display_User() {
    // console.log("inside the function")

    // get into the right collection
    db.collection("users").doc("groups")
        .onSnapshot(groupsDoc => {
            // console.log(groupsDoc.data());
            document.getElementById("username").innerHTML = groupsDoc.data().user;
        })
}
// read_display_User();

function insertName() {
    // to check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid); // let me to know who is the user that logged in to get the UID
            currentUser = db.collection("users").doc(user.uid); // will go to the firestore and go to the document
            currentUser.get().then(userDoc => {
                // get the user name
                var user_Name = userDoc.data().name;
                console.log(user_Name);
                $("#party__member-name").text(user_Name); //jquery
                // document.getElementById("party_member").innetText = user_Name;
            })
        }

    })
}
// insertName();

(async () => {
    $("section[region='suggestions'").hide();
    updateView();

    function populateCardsDynamically(type) {
        const suggestionsCardTemplate = document.querySelector("section[region='suggestions'] template#suggestions_card");
        const suggestionsCardGroup = document.querySelector("section[region='suggestions'] .u-card-group");

        db.collection(type).get()
            .then(allSuggestion => {
                allSuggestion.forEach(doc => {
                    const { name, id, description, image } = doc.data();

                    const suggestionCard = suggestionsCardTemplate.content.cloneNode(true);
                    suggestionCard.querySelector(".card-title").innerHTML = name;
                    suggestionCard.querySelector(".card-length").innerHTML = description;
                    suggestionCard.querySelector(".card-btn").onclick = () => window.location.assign('../page_info_template/page_info_template.html?code=' + id.toUpperCase());
                    suggestionCard.querySelector("img").src = image;

                    suggestionsCardGroup.appendChild(suggestionCard);
                })
            })
    }

    async function doesGroupExist(groupId) {
        const groupDoc = db.collection('groups').doc(groupId);
        const snapshot = await groupDoc.get();

        return !!snapshot.exists;
    }

    async function fetchCurrentUserGroup() {
        const currentUser = await fetchFirestoreDoc('users', (await getCurrentUser()).uid);
        const { groupId } = currentUser.data();

        if (!groupId) return null;

        if (doesGroupExist(groupId)) {
            return db.collection('groups').doc(groupId);
        }

        console.error('Group does not exist');
        return null;
    }

    async function fetchGroupsSnapshot(type) {
        const snapshots = await db.collection('groups').where('type', '==', type).get();

        return snapshots.docs;
    }

    function filterOpenGroups(groupDocs) {
        return groupDocs.filter(doc => doc.data().members.length <= 5);
    }

    async function addUserToGroup(groupDoc) {
        const userId = (await getCurrentUser()).uid;

        db.collection('groups').doc(groupDoc.id).set({
            members: firebase.firestore.FieldValue.arrayUnion(db.doc('/users/' + userId)),
        }, {
            merge: true,
        });

        db.collection('users').doc(userId).set({
            groupId: groupDoc.id,
        }, {
            merge: true,
        })
    }

    async function updateView() {
        if (await fetchCurrentUserGroup()) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    db.collection("users").doc(user.uid).get()
                        .then(async doc => {
                            const { type, groupId } = doc.data();

                            populateCardsDynamically(type);

                            const groupSnapshot = await db.collection('groups').doc(groupId).get();
                            const { members } = groupSnapshot.data();

                            const memberDocuments = await Promise.all(members.map(member => member.get()));
                            memberDocuments.forEach(memberDocument => {
                                const { name } = memberDocument.data();
                                const memberRow = document.querySelector('#t-member').content.cloneNode(true);
                                memberRow.querySelector('.member__name').textContent = name;

                                document.querySelector("section[region='group'").append(memberRow);
                            });
                        });
                }
            });

            $("section[region='suggestions']").show();
            $('.findGroupBtn').remove();
        }
    }

    const findGroupBtn = document.querySelector('#findGroup');

    findGroupBtn.onclick = async () => {
        findGroupBtn.setAttribute('disabled', true);
        findGroupBtn.classList.remove('btn-primary');
        findGroupBtn.classList.add('btn-secondary');

        const { type } = (await fetchFirestoreDoc('users', (await getCurrentUser()).uid)).data();

        const groups = filterOpenGroups(await fetchGroupsSnapshot(type));

        const isUserInGroup = await fetchCurrentUserGroup();

        if (!isUserInGroup) {
            addUserToGroup(groups[0]);
        } else {
            console.warn('You\'re already in a group.');
        }

        updateView();
    }


    function setSuggestionData(id) {
        localStorage.setItem("suggestionID", id);
    }
})();
