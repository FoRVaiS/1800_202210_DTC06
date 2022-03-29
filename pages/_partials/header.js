$(function login() {

    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {

        });
    }
});